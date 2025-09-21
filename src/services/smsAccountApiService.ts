// SMS Account API Service - ใช้ Direct API แทน Puppeteer
import { supabase } from '../lib/supabase';

// Generated Account Interface - เหมือนเดิมเพื่อ backward compatibility
export interface GeneratedAccount {
  accountName?: string;
  username: string;
  email: string;
  password: string;
  sender?: string;
  accountId?: string;
  status?: string;
  createdAt?: string;
}

// User Generation Data Interface (legacy compatibility)
export interface LegacyUserGenerationData {
  username: string;
  email: string;
  password: string;
  originalEmail: string;
  sender: string;
  accountId: string;
  status: string;
  createdAt: string;
}

// SMS Account API Request
export interface SMSAccountRequest {
  userId?: string;
  creditAmount?: number;
  username?: string; // เพิ่ม field สำหรับ custom username
}

// SMS Account API Response
export interface SMSAccountResponse {
  success: boolean;
  message: string;
  data: {
    accountId: string;
    username: string;
    email: string;
    sender: string;
    status: string;
    createdAt: string;
    hasCredentials: boolean;
  };
}

// Error Response Interface
export interface APIErrorResponse {
  error: string;
  details?: string;
  username?: string;
}

/**
 * Generate SMS Account ผ่าน Direct API
 * แทนที่ระบบ Puppeteer เดิม
 */
export const generateSMSAccount = async (
  onProgress?: (step: string, progress: number) => void,
  customUsername?: string,
  userData?: { username: string; email: string; creditAmount?: number }
): Promise<GeneratedAccount> => {
  
  // Progress callback helper
  const updateProgress = (step: string, progress: number) => {
    console.log(`📊 ${step} (${progress}%)`);
    onProgress?.(step, progress);
  };

  try {
    updateProgress('เริ่มสร้าง SMS Account', 10);

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('ไม่พบ session ของผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่');
    }

    updateProgress('กำลังตรวจสอบข้อมูลผู้ใช้', 20);

    // Prepare request data
    const requestData: SMSAccountRequest = {
      creditAmount: userData?.creditAmount || 1, // Default 1 credit
      username: customUsername // ส่ง custom username ถ้ามี
    };

    updateProgress('กำลังเรียก API เพื่อสร้าง Account', 30);

    console.log('🔍 Request data:', requestData);
    console.log('🔍 Session token:', session.access_token);

    // Call Edge Function
    const { data, error } = await supabase.functions.invoke('create-sms-account', {
      body: requestData,
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔍 Edge Function Response:', { data, error });

    if (error) {
      console.error('❌ Edge Function Error:', error);
      
      // Check if it's a 409 (Conflict) which means username duplicate
      if (error.message?.includes('409') || error.message?.includes('Conflict')) {
        // This is likely a username duplicate error
        throw new Error(`USERNAME_ALREADY_EXISTS: ชื่อผู้ใช้ "${customUsername || 'ที่ระบุ'}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
      }
      
      throw new Error(`การสร้าง SMS Account ล้มเหลว: ${error.message}`);
    }

    updateProgress('กำลังประมวลผลข้อมูลที่ได้รับ', 60);

    if (!data.success) {
      console.error('❌ API Response Error:', data);
      
      // Handle specific error cases
      if (data.error === 'USERNAME_ALREADY_EXISTS' || data.message?.includes('ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว')) {
        throw new Error(`USERNAME_ALREADY_EXISTS: ชื่อผู้ใช้ "${data.username || customUsername}" มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น`);
      }
      
      if (data.error?.includes('User profile not found')) {
        throw new Error('ไม่พบข้อมูลโปรไฟล์ผู้ใช้ กรุณาอัปเดตข้อมูลโปรไฟล์ก่อน');
      }

      throw new Error(data.message || data.error || 'การสร้าง SMS Account ล้มเหลว');
    }

    updateProgress('กำลังจัดเตรียมข้อมูลผลลัพธ์', 80);

    // No need to fetch credentials separately - they come with the response now
    updateProgress('สำเร็จ! SMS Account ถูกสร้างเรียบร้อย', 100);

    // Return data in the same format as the old puppeteer service
    const result: GeneratedAccount = {
      accountName: `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim(),
      username: data.data.username,
      email: data.data.email,
      password: data.data.password || '[รหัสผ่านถูกจัดเก็บปลอดภัย]', // Use password from response
      sender: data.data.sender,
      accountId: data.data.accountId,
      status: data.data.status,
      createdAt: data.data.createdAt
    };

    console.log('✅ SMS Account created successfully:', {
      ...result,
      password: '[HIDDEN]'
    });

    return result;

  } catch (error) {
    console.error('💥 SMS Account Generation Error:', error);
    updateProgress('เกิดข้อผิดพลาด: ' + (error as Error).message, 0);
    throw error;
  }
};

/**
 * Get Account Credentials from Database (for password retrieval)
 */
async function getAccountCredentials(accountId: string): Promise<{ password: string } | null> {
  try {
    const { data, error } = await supabase
      .from('sms_accounts')
      .select('encrypted_password')
      .eq('id', accountId)
      .single();

    if (error || !data) {
      console.warn('⚠️ Could not retrieve account credentials');
      return null;
    }

    // Decode password (this is basic base64 - in production should use proper decryption)
    const password = atob(data.encrypted_password);
    return { password };

  } catch (error) {
    console.error('❌ Error retrieving credentials:', error);
    return null;
  }
}

/**
 * Get SMS Account Status
 */
export const getSMSAccountStatus = async (accountId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('sms_accounts')
      .select('status')
      .eq('id', accountId)
      .single();

    if (error || !data) {
      return 'unknown';
    }

    return data.status;
  } catch (error) {
    console.error('Error getting account status:', error);
    return 'error';
  }
};

/**
 * List User's SMS Accounts
 */
export const getUserSMSAccounts = async (): Promise<any[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('sms_accounts')
      .select('id, account_name, username, email, status, sender_name, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user SMS accounts:', error);
    return [];
  }
};

/**
 * Delete SMS Account (marks as deleted)
 */
export const deleteSMSAccount = async (accountId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('sms_accounts')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting SMS account:', error);
    return false;
  }
};

// Backward compatibility - export interfaces and config
export interface SMSBotClient {
  generateAccount(): Promise<GeneratedAccount>;
}

export interface BotConfig {
  headless: boolean;
  timeout: number;
  retryAttempts: number;
  baseUrl: string;
  selectors: any;
}

// Mock config for backward compatibility (not used in new API approach)
export const botConfig: BotConfig = {
  headless: true,
  timeout: 30000,
  retryAttempts: 3,
  baseUrl: 'https://web.smsup-plus.com',
  selectors: {}
};

// Re-export types for backward compatibility
export type UserGenerationData = LegacyUserGenerationData;

/**
 * Health Check for SMS Account Service
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    // Simple check by trying to get session
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('SMS Account Service health check failed:', error);
    return false;
  }
};

/**
 * Get Service Status
 */
export const getServiceStatus = async (): Promise<{
  available: boolean;
  method: string;
  lastCheck: string;
}> => {
  const available = await healthCheck();
  
  return {
    available,
    method: 'Direct API',
    lastCheck: new Date().toISOString()
  };
};