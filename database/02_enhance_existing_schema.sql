-- Enhanced Schema Migration for Existing SMS System
-- ปรับปรุงจาก schema เดิมแบบ incremental
-- Created: September 13, 2025

-- ===================================
-- 1. เพิ่ม columns ใน profiles table
-- ===================================

-- เพิ่ม fields ที่จำเป็นใน profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role character varying(20) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS credit_balance integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS status character varying(20) DEFAULT 'active';

-- เพิ่ม constraint สำหรับ role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_role_check'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('user', 'admin', 'superadmin'));
    END IF;
END $$;

-- เพิ่ม constraint สำหรับ status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_status_check'
    ) THEN
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_status_check 
        CHECK (status IN ('active', 'inactive', 'suspended', 'deleted'));
    END IF;
END $$;

-- เพิ่ม indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at);

-- ===================================
-- 2. ปรับปรุง sms_accounts table
-- ===================================

-- เพิ่ม columns ใหม่
ALTER TABLE sms_accounts
ADD COLUMN IF NOT EXISTS original_email character varying(255),
ADD COLUMN IF NOT EXISTS encrypted_password text,
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_used_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS sms_website_url character varying(500) DEFAULT 'https://web.smsup-plus.com',
ADD COLUMN IF NOT EXISTS sender_name character varying(100);

-- อัพเดท original_email จาก profiles
UPDATE sms_accounts 
SET original_email = p.email
FROM profiles p 
WHERE sms_accounts.profile_id = p.id 
AND sms_accounts.original_email IS NULL;

-- เข้ารหัส password เดิม (ถ้ามี)
UPDATE sms_accounts 
SET encrypted_password = encode(digest(password, 'sha256'), 'base64')
WHERE encrypted_password IS NULL AND password IS NOT NULL;

-- ===================================
-- 3. สร้าง tables ใหม่ที่จำเป็น
-- ===================================

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  sms_account_id uuid REFERENCES sms_accounts(id) ON DELETE SET NULL,
  action character varying(100) NOT NULL,
  description text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_profile_id ON activity_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type character varying(50) NOT NULL,
  title character varying(255) NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  is_email_sent boolean DEFAULT false,
  is_sms_sent boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key character varying(100) UNIQUE NOT NULL,
  setting_value text NOT NULL,
  setting_type character varying(50) DEFAULT 'string',
  description text,
  is_public boolean DEFAULT false,
  is_editable boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- เพิ่ม trigger สำหรับ system_settings
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_system_settings_updated_at'
    ) THEN
        CREATE TRIGGER update_system_settings_updated_at 
        BEFORE UPDATE ON system_settings
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- API Keys Table (for future use)
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key_name character varying(100) NOT NULL,
  api_key character varying(255) UNIQUE NOT NULL,
  api_secret_hash text,
  permissions jsonb DEFAULT '[]',
  rate_limit integer DEFAULT 1000,
  is_active boolean DEFAULT true,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_profile_id ON api_keys(profile_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- เพิ่ม trigger สำหรับ api_keys
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_api_keys_updated_at'
    ) THEN
        CREATE TRIGGER update_api_keys_updated_at 
        BEFORE UPDATE ON api_keys
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ===================================
-- 4. ปรับปรุง sms_account_logs 
-- ===================================

-- เพิ่ม columns สำหรับ enhanced tracking
ALTER TABLE sms_account_logs
ADD COLUMN IF NOT EXISTS retry_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS job_priority character varying(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS estimated_completion_at timestamp with time zone;

-- เพิ่ม constraint สำหรับ priority
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'sms_account_logs_priority_check'
    ) THEN
        ALTER TABLE sms_account_logs 
        ADD CONSTRAINT sms_account_logs_priority_check 
        CHECK (job_priority IN ('low', 'normal', 'high', 'critical'));
    END IF;
END $$;

-- ===================================
-- 5. Row Level Security (RLS)
-- ===================================

-- Enable RLS บน tables ใหม่
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies สำหรับ tables ใหม่
-- Activity Logs Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_logs' AND policyname = 'activity_logs_policy'
    ) THEN
        CREATE POLICY activity_logs_policy ON activity_logs FOR ALL 
        USING (auth.uid() = profile_id);
    END IF;
END $$;

-- Notifications Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'notifications_policy'
    ) THEN
        CREATE POLICY notifications_policy ON notifications FOR ALL 
        USING (auth.uid() = profile_id);
    END IF;
END $$;

-- API Keys Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'api_keys' AND policyname = 'api_keys_policy'
    ) THEN
        CREATE POLICY api_keys_policy ON api_keys FOR ALL 
        USING (auth.uid() = profile_id);
    END IF;
END $$;

-- System Settings Policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'system_settings' AND policyname = 'system_settings_read_policy'
    ) THEN
        CREATE POLICY system_settings_read_policy ON system_settings FOR SELECT 
        USING (is_public = true OR auth.jwt()->>'role' = 'admin');
    END IF;
END $$;

-- ===================================
-- 6. Insert Default System Settings
-- ===================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'SMS Auto-Bot System', 'string', 'ชื่อแอปพลิเคชัน', true),
('app_version', '1.0.0', 'string', 'เวอร์ชันแอปพลิเคชัน', true),
('max_account_per_user', '10', 'number', 'จำนวน SMS Account สูงสุดต่อผู้ใช้', false),
('account_creation_timeout', '60', 'number', 'Timeout การสร้าง Account (วินาที)', false),
('max_retry_attempts', '3', 'number', 'จำนวนครั้งสูงสุดในการลองใหม่', false),
('batch_size_limit', '5', 'number', 'จำนวนสูงสุดสำหรับ batch creation', false),
('maintenance_mode', 'false', 'boolean', 'โหมดปิดปรับปรุงระบบ', true),
('sms_website_url', 'https://web.smsup-plus.com', 'string', 'URL ของเว็บไซต์ SMS หลัก', false),
('notification_email_enabled', 'true', 'boolean', 'เปิดใช้งานการแจ้งเตือนทาง Email', false),
('rate_limit_per_hour', '100', 'number', 'จำกัดจำนวน request ต่อชั่วโมง', false),
('password_min_length', '12', 'number', 'ความยาวขั้นต่ำของรหัสผ่าน', true)
ON CONFLICT (setting_key) DO NOTHING;

-- ===================================
-- 7. Create Views สำหรับ reporting (optional)
-- ===================================

CREATE OR REPLACE VIEW sms_account_summary AS
SELECT 
    p.id as profile_id,
    p.first_name,
    p.last_name,
    p.email,
    p.account_type,
    COUNT(sa.id) as total_sms_accounts,
    COUNT(CASE WHEN sa.status = 'success' THEN 1 END) as successful_accounts,
    COUNT(CASE WHEN sa.status = 'failed' THEN 1 END) as failed_accounts,
    MAX(sa.created_at) as last_account_created
FROM profiles p
LEFT JOIN sms_accounts sa ON p.id = sa.profile_id
GROUP BY p.id, p.first_name, p.last_name, p.email, p.account_type;

-- ===================================
-- COMMENTS for Documentation
-- ===================================

COMMENT ON TABLE activity_logs IS 'ตารางบันทึกกิจกรรมของผู้ใช้งานและระบบ';
COMMENT ON TABLE notifications IS 'ตารางการแจ้งเตือนแบบ real-time';
COMMENT ON TABLE system_settings IS 'ตารางการตั้งค่าระบบและ configuration';
COMMENT ON TABLE api_keys IS 'ตาราง API Keys สำหรับการเชื่อมต่อภายนอก';
COMMENT ON VIEW sms_account_summary IS 'View สรุปข้อมูล SMS Accounts ของแต่ละผู้ใช้';

-- ===================================
-- 8. Create indexes สำหรับ performance
-- ===================================

-- เพิ่ม composite indexes
CREATE INDEX IF NOT EXISTS idx_sms_accounts_profile_status ON sms_accounts(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_sms_account_logs_account_status ON sms_account_logs(sms_account_id, status);
CREATE INDEX IF NOT EXISTS idx_profiles_account_type_status ON profiles(account_type, status);

-- Partial indexes สำหรับ active records
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sms_accounts_success ON sms_accounts(profile_id) WHERE status = 'success';
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(profile_id, created_at) WHERE is_read = false;

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- ตรวจสอบ tables ที่สร้างแล้ว
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN ('profiles', 'sms_accounts', 'sms_account_logs', 'activity_logs', 'notifications', 'system_settings', 'api_keys')
ORDER BY table_name;