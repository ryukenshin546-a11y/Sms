import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

// Type aliases for easier use
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type SMSAccount = Database['public']['Tables']['sms_accounts']['Row'];
type SMSAccountInsert = Database['public']['Tables']['sms_accounts']['Insert'];
type SMSAccountUpdate = Database['public']['Tables']['sms_accounts']['Update'];

type SMSAccountLog = Database['public']['Tables']['sms_account_logs']['Row'];
type SMSAccountLogInsert = Database['public']['Tables']['sms_account_logs']['Insert'];
type SMSAccountLogUpdate = Database['public']['Tables']['sms_account_logs']['Update'];

// Base Service Class
export abstract class BaseService {
  protected client: SupabaseClient;

  constructor(client: SupabaseClient = supabase) {
    this.client = client;
  }

  protected handleError(error: any): never {
    console.error('Database Error:', error);
    throw new Error(error.message || 'Database operation failed');
  }
}

// Profile Service
export class ProfileService extends BaseService {
  async createProfile(profileData: ProfileInsert): Promise<Profile> {
    try {
      console.log('🚀 Creating profile with authenticated user');
      console.log('📝 Profile data:', { ...profileData, password: '[HIDDEN]' });
      
      // Use regular client - user should be authenticated now
      const { data, error } = await this.client
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile creation failed:', error);
        this.handleError(error);
      }
      
      console.log('✅ Profile created successfully with ID:', data?.id);
      return data;
    } catch (error) {
      console.error('❌ Profile service error:', error);
      this.handleError(error);
    }
  }

  async getProfileById(id: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') this.handleError(error);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfileByEmail(email: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') this.handleError(error);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(id: string, updates: ProfileUpdate): Promise<Profile> {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

// SMS Account Service
export class SMSAccountService extends BaseService {
  async createSMSAccount(accountData: SMSAccountInsert): Promise<SMSAccount> {
    try {
      const { data, error } = await this.client
        .from('sms_accounts')
        .insert(accountData)
        .select()
        .single();

      if (error) this.handleError(error);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSMSAccountById(id: string): Promise<SMSAccount | null> {
    try {
      const { data, error } = await this.client
        .from('sms_accounts')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') this.handleError(error);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateAccountStatus(
    id: string, 
    status: string, 
    errorMessage?: string
  ): Promise<SMSAccount> {
    try {
      const updates: SMSAccountUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (errorMessage) {
        updates.error_message = errorMessage;
      }

      const { data, error } = await this.client
        .from('sms_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

// SMS Account Log Service
export class SMSAccountLogService extends BaseService {
  async createLog(logData: SMSAccountLogInsert): Promise<SMSAccountLog> {
    try {
      const { data, error } = await this.client
        .from('sms_account_logs')
        .insert(logData)
        .select()
        .single();

      if (error) this.handleError(error);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateLog(id: string, updates: SMSAccountLogUpdate): Promise<SMSAccountLog> {
    try {
      const { data, error } = await this.client
        .from('sms_account_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error);
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Dashboard Service
export class DashboardService extends BaseService {
  async getDashboardStats() {
    try {
      const [
        profilesResult,
        smsAccountsResult,
        successAccountsResult,
        failedAccountsResult,
        pendingAccountsResult,
      ] = await Promise.all([
        this.client.from('profiles').select('*', { count: 'exact', head: true }),
        this.client.from('sms_accounts').select('*', { count: 'exact', head: true }),
        this.client.from('sms_accounts').select('*', { count: 'exact', head: true }).eq('status', 'success'),
        this.client.from('sms_accounts').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
        this.client.from('sms_accounts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const totalSMSAccounts = smsAccountsResult.count || 0;
      const successfulAccounts = successAccountsResult.count || 0;
      const successRate = totalSMSAccounts > 0 ? (successfulAccounts / totalSMSAccounts) * 100 : 0;

      return {
        totalProfiles: profilesResult.count || 0,
        totalSMSAccounts,
        successfulAccounts,
        failedAccounts: failedAccountsResult.count || 0,
        pendingAccounts: pendingAccountsResult.count || 0,
        accountsCreatedToday: 0,
        averageCreationTime: 0,
        successRate,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}

// Export instances
export const profileService = new ProfileService();
export const smsAccountService = new SMSAccountService();
export const smsAccountLogService = new SMSAccountLogService();
export const dashboardService = new DashboardService();