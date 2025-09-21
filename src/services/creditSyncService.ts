import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

// Type definitions
interface CreditSyncResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    balance: number;
    last_sync_at: string;
    api_response: any;
  };
  fromCache?: boolean;
  error?: string;
}

interface CreditBalanceRecord {
  id: string;
  user_id: string;
  balance: number;
  last_sync_at: string;
  sync_status: 'success' | 'error' | 'pending';
  error_message?: string;
  api_response?: any;
  created_at: string;
  updated_at: string;
}

export class CreditSyncService {
  private static readonly EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-credit`;

  /**
   * เรียก Edge Function เพื่อ sync ยอดเครดิต
   */
  static async syncCreditBalance(forceSync = false): Promise<CreditSyncResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('ไม่พบ session หรือ access token');
      }

      console.log('🚀 เรียก Edge Function เพื่อ sync เครดิต...');
      
      const response = await fetch(this.EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          forceSync
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result: CreditSyncResponse = await response.json();
      
      if (result.success) {
        console.log('✅ Sync เครดิตสำเร็จ:', result.data);
      } else {
        console.error('❌ Sync เครดิตล้มเหลว:', result.error);
      }

      return result;

    } catch (error) {
      console.error('💥 เกิดข้อผิดพลาดในการ sync เครดิต:', error);
      
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการ sync เครดิต',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ดึงยอดเครดิตล่าสุดจาก user_profiles table
   */
  static async getCurrentCreditBalance(userId?: string): Promise<any | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        throw new Error('ไม่พบ User ID');
      }

      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('id, credit_balance, updated_at')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('ข้อผิดพลาดในการดึงข้อมูลเครดิต:', error);
        return null;
      }

      return data ? {
        user_id: data.id,
        balance: data.credit_balance || 0,
        last_sync_at: data.updated_at
      } : null;

    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      return null;
    }
  }

  /**
   * เช็คและ sync เครดิตอัตโนมัติ (ถ้าข้อมูลเก่าเกิน 5 นาที)
   */
  static async checkAndSyncIfNeeded(): Promise<CreditSyncResponse> {
    try {
      const currentBalance = await this.getCurrentCreditBalance();
      
      if (!currentBalance) {
        console.log('ไม่พบข้อมูลเครดิต - จะ sync ใหม่');
        return await this.syncCreditBalance(true);
      }

      const lastSyncTime = new Date(currentBalance.last_sync_at);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60);

      if (diffMinutes >= 5) {
        console.log(`ข้อมูลเก่า ${diffMinutes.toFixed(1)} นาที - จะ sync ใหม่`);
        return await this.syncCreditBalance(true);
      } else {
        console.log(`ใช้ข้อมูลเดิม (อายุ ${diffMinutes.toFixed(1)} นาที)`);
        return {
          success: true,
          message: 'ใช้ข้อมูลจากแคช',
          data: {
            user_id: currentBalance.user_id,
            balance: currentBalance.balance,
            last_sync_at: currentBalance.last_sync_at,
            api_response: null
          },
          fromCache: true
        };
      }

    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการเช็ค sync:', error);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการเช็คข้อมูล',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * ติดตาม sync status แบบ realtime (user_profiles table)
   */
  static async subscribeToCreditUpdates(
    callback: (data: any) => void,
    userId?: string
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    const targetUserId = userId || user?.id;

    if (!targetUserId) {
      console.error('ไม่พบ User ID สำหรับ subscribe');
      return null;
    }

    const channel = supabase
      .channel('user-profiles-credit-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${targetUserId}`
      }, (payload) => {
        console.log('📡 User profile credit updated:', payload);
        if (payload.new && payload.new.credit_balance !== payload.old?.credit_balance) {
          callback({
            user_id: payload.new.id,
            balance: payload.new.credit_balance,
            last_sync_at: payload.new.updated_at,
            sync_status: 'success'
          });
        }
      })
      .subscribe();

    return channel;
  }
}