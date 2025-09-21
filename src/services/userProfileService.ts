import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  account_type?: string;
  company_name?: string;
  tax_id?: string;
  business_address?: string;
  credit_balance?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  username?: string;
  can_use_autobot?: boolean;
}

export interface CreditBalanceResponse {
  credit_balance: number;
  status: string;
  account_type: string;
  can_use_autobot: boolean;
}

export class UserProfileService {
  /**
   * ดึงข้อมูลเครดิตคงเหลือของผู้ใช้
   * @param userId - ID ของผู้ใช้
   * @returns Promise<CreditBalanceResponse>
   */
  static async getCreditBalance(userId: string): Promise<CreditBalanceResponse> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('credit_balance, status, account_type, email_verified, phone_verified')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching credit balance:', error);
        throw new Error(`ไม่สามารถดึงข้อมูลเครดิตได้: ${error.message}`);
      }

      if (!data) {
        throw new Error('ไม่พบข้อมูลโปรไฟล์ผู้ใช้');
      }

      const can_use_autobot = (data.email_verified || false) && (data.phone_verified || false);

      return {
        credit_balance: data.credit_balance || 0,
        status: data.status || 'active',
        account_type: data.account_type || 'personal',
        can_use_autobot
      };
    } catch (error) {
      console.error('Credit balance fetch error:', error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลโปรไฟล์ผู้ใช้แบบครบถ้วน
   * @param userId - ID ของผู้ใช้
   * @returns Promise<UserProfile>
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw new Error(`ไม่สามารถดึงข้อมูลโปรไฟล์ได้: ${error.message}`);
      }

      if (!data) {
        throw new Error('ไม่พบข้อมูลโปรไฟล์ผู้ใช้');
      }

      return {
        ...data,
        can_use_autobot: (data.email_verified || false) && (data.phone_verified || false)
      };
    } catch (error) {
      console.error('User profile fetch error:', error);
      throw error;
    }
  }

  /**
   * อัปเดตเครดิตคงเหลือของผู้ใช้
   * @param userId - ID ของผู้ใช้
   * @param newBalance - ยอดเครดิตใหม่
   * @returns Promise<UserProfile>
   */
  static async updateCreditBalance(userId: string, newBalance: number): Promise<UserProfile> {
    try {
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .update({
          credit_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating credit balance:', error);
        throw new Error(`ไม่สามารถอัปเดตเครดิตได้: ${error.message}`);
      }

      return {
        ...data,
        can_use_autobot: (data.email_verified || false) && (data.phone_verified || false)
      };
    } catch (error) {
      console.error('Credit balance update error:', error);
      throw error;
    }
  }

  /**
   * เพิ่มเครดิตให้ผู้ใช้
   * @param userId - ID ของผู้ใช้
   * @param amount - จำนวนเครดิตที่ต้องการเพิ่ม
   * @returns Promise<UserProfile>
   */
  static async addCredit(userId: string, amount: number): Promise<UserProfile> {
    try {
      // ดึงเครดิตปัจจุบันก่อน
      const currentProfile = await this.getUserProfile(userId);
      const newBalance = (currentProfile.credit_balance || 0) + amount;

      return await this.updateCreditBalance(userId, newBalance);
    } catch (error) {
      console.error('Add credit error:', error);
      throw error;
    }
  }

  /**
   * ลดเครดิตของผู้ใช้
   * @param userId - ID ของผู้ใช้
   * @param amount - จำนวนเครดิตที่ต้องการลด
   * @returns Promise<UserProfile>
   */
  static async deductCredit(userId: string, amount: number): Promise<UserProfile> {
    try {
      // ดึงเครดิตปัจจุบันก่อน
      const currentProfile = await this.getUserProfile(userId);
      const currentBalance = currentProfile.credit_balance || 0;

      if (currentBalance < amount) {
        throw new Error('เครดิตคงเหลือไม่เพียงพอ');
      }

      const newBalance = currentBalance - amount;
      return await this.updateCreditBalance(userId, newBalance);
    } catch (error) {
      console.error('Deduct credit error:', error);
      throw error;
    }
  }
}