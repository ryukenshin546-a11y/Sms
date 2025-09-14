// Enhanced Types for Existing Schema
// Works with existing profiles, sms_accounts, sms_account_logs tables
// Updated: September 13, 2025

// ===================================
// BASE DATABASE TYPES (from existing schema)
// ===================================

export interface Profile {
  id: string;
  account_type: 'individual' | 'corporate';
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  company?: string | null;
  business_type?: string | null;
  password: string; // Note: migrate to Supabase Auth later
  company_registration?: string | null;
  company_name_th?: string | null;
  company_name_en?: string | null;
  company_address?: string | null;
  tax_id?: string | null;
  company_phone?: string | null;
  authorized_person?: string | null;
  position?: string | null;
  created_at?: string;
  updated_at?: string;
  sms_account_generated?: boolean;
  sms_generated_at?: string | null;
  sms_account_data?: Record<string, any> | null;
  
  // New fields from migration
  role?: 'user' | 'admin' | 'superadmin';
  credit_balance?: number;
  email_verified?: boolean;
  phone_verified?: boolean;
  last_login_at?: string | null;
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';
}

export interface SMSAccount {
  id: string;
  profile_id?: string | null;
  account_name: string;
  username: string;
  email: string;
  password: string;
  credits_added?: number;
  status?: 'pending' | 'generating' | 'success' | 'failed';
  error_message?: string | null;
  process_started_at?: string | null;
  process_completed_at?: string | null;
  process_duration_seconds?: number | null;
  created_at?: string;
  updated_at?: string;
  
  // New fields from migration
  original_email?: string | null;
  encrypted_password?: string | null;
  is_verified?: boolean;
  last_used_at?: string | null;
  sms_website_url?: string;
  sender_name?: string | null;
}

export interface SMSAccountLog {
  id: string;
  sms_account_id?: string | null;
  step_name: string;
  step_description?: string | null;
  progress_percentage?: number;
  status?: 'running' | 'completed' | 'failed';
  error_message?: string | null;
  error_stack?: string | null;
  step_started_at?: string;
  step_completed_at?: string | null;
  step_duration_ms?: number | null;
  
  // New fields from migration
  retry_count?: number;
  max_retries?: number;
  job_priority?: 'low' | 'normal' | 'high' | 'critical';
  estimated_completion_at?: string | null;
}

export interface ActivityLog {
  id: string;
  profile_id?: string | null;
  sms_account_id?: string | null;
  action: string;
  description: string;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  message: string;
  is_read?: boolean;
  is_email_sent?: boolean;
  is_sms_sent?: boolean;
  metadata?: Record<string, any>;
  created_at?: string;
  read_at?: string | null;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type?: string;
  description?: string | null;
  is_public?: boolean;
  is_editable?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Insert/Update types
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;

export type SMSAccountInsert = Omit<SMSAccount, 'id' | 'created_at' | 'updated_at'>;
export type SMSAccountUpdate = Partial<Omit<SMSAccount, 'id' | 'created_at'>>;

export type SMSAccountLogInsert = Omit<SMSAccountLog, 'id' | 'step_started_at'>;
export type SMSAccountLogUpdate = Partial<Omit<SMSAccountLog, 'id' | 'sms_account_id'>>;

export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'>;
export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;
export type SystemSettingInsert = Omit<SystemSetting, 'id' | 'created_at' | 'updated_at'>;

// ===================================
// ENUMS & CONSTANTS
// ===================================

export const AccountTypes = {
  INDIVIDUAL: 'individual' as const,
  CORPORATE: 'corporate' as const,
} as const;

export const UserRoles = {
  USER: 'user' as const,
  ADMIN: 'admin' as const,
  SUPERADMIN: 'superadmin' as const,
} as const;

export const AccountStatuses = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  SUSPENDED: 'suspended' as const,
  DELETED: 'deleted' as const,
} as const;

export const SMSAccountStatuses = {
  PENDING: 'pending' as const,
  GENERATING: 'generating' as const,
  SUCCESS: 'success' as const,
  FAILED: 'failed' as const,
} as const;

export const LogStatuses = {
  RUNNING: 'running' as const,
  COMPLETED: 'completed' as const,
  FAILED: 'failed' as const,
} as const;

export const JobPriorities = {
  LOW: 'low' as const,
  NORMAL: 'normal' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
} as const;

// Type guards
export const isValidAccountType = (value: string): value is keyof typeof AccountTypes => {
  return Object.values(AccountTypes).includes(value as any);
};

export const isValidUserRole = (value: string): value is keyof typeof UserRoles => {
  return Object.values(UserRoles).includes(value as any);
};

export const isValidSMSAccountStatus = (value: string): value is keyof typeof SMSAccountStatuses => {
  return Object.values(SMSAccountStatuses).includes(value as any);
};

// ===================================
// HELPER TYPES
// ===================================

export interface SMSAccountWithProfile extends SMSAccount {
  profile?: Profile | null;
}

export interface ProfileWithSMSAccounts extends Profile {
  sms_accounts?: SMSAccount[];
  sms_account_count?: number;
}

export interface SMSAccountWithLogs extends SMSAccount {
  logs?: SMSAccountLog[];
  latest_log?: SMSAccountLog | null;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// SMS Account Generation Progress
export interface GenerationProgress {
  jobId: string;
  progress: number;
  currentStep: string;
  status: keyof typeof SMSAccountStatuses;
  estimatedTimeRemaining?: number; // seconds
  error?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalProfiles: number;
  totalSMSAccounts: number;
  successfulAccounts: number;
  failedAccounts: number;
  pendingAccounts: number;
  accountsCreatedToday: number;
  averageCreationTime: number; // seconds
  successRate: number; // percentage
}

// Settings Management
export interface AppSettings {
  maxAccountPerUser: number;
  accountCreationTimeout: number;
  maxRetryAttempts: number;
  batchSizeLimit: number;
  maintenanceMode: boolean;
  smsWebsiteUrl: string;
  notificationEmailEnabled: boolean;
  rateLimitPerHour: number;
  passwordMinLength: number;
}

// ===================================
// ERROR TYPES
// ===================================

export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface BusinessError {
  type: 'LIMIT_EXCEEDED' | 'ACCOUNT_EXISTS' | 'INSUFFICIENT_CREDITS' | 'MAINTENANCE_MODE';
  message: string;
  data?: Record<string, any>;
}