-- SMS Auto-Bot System - Initial Database Schema
-- Created: September 13, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE generation_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
CREATE TYPE job_priority AS ENUM ('low', 'normal', 'high', 'critical');

-- ===================================
-- USERS TABLE - ตารางผู้ใช้งานระบบ
-- ===================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  business_type VARCHAR(100),
  role user_role DEFAULT 'user',
  status account_status DEFAULT 'active',
  credit_balance INTEGER DEFAULT 0,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ===================================
-- SMS_ACCOUNTS TABLE - ตาราง SMS Sub Accounts ที่สร้างแล้ว
-- ===================================
CREATE TABLE sms_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- SMS Account Credentials
  account_name VARCHAR(100) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  encrypted_password TEXT NOT NULL, -- เข้ารหัสแล้ว
  original_email VARCHAR(255) NOT NULL, -- email ของ user จริง
  
  -- Account Status & Metadata
  status account_status DEFAULT 'active',
  is_verified BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMPTZ,
  
  -- SMS Website Integration
  sms_website_url VARCHAR(500) DEFAULT 'https://web.smsup-plus.com',
  sender_name VARCHAR(100), -- Sender ที่เลือกใช้
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT sms_accounts_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT sms_accounts_original_email_check CHECK (original_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ===================================
-- GENERATION_JOBS TABLE - ตารางงานสร้าง SMS Account
-- ===================================
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sms_account_id UUID REFERENCES sms_accounts(id) ON DELETE SET NULL,
  
  -- Job Configuration
  job_type VARCHAR(50) DEFAULT 'single_account', -- 'single_account', 'batch_accounts'
  priority job_priority DEFAULT 'normal',
  batch_size INTEGER DEFAULT 1,
  
  -- Job Status & Progress
  status generation_status DEFAULT 'pending',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step TEXT,
  
  -- Job Results
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 1,
  
  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Estimated completion time (optional)
  estimated_completion_at TIMESTAMPTZ
);

-- ===================================
-- ACTIVITY_LOGS TABLE - ตารางบันทึกกิจกรรม
-- ===================================
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sms_account_id UUID REFERENCES sms_accounts(id) ON DELETE SET NULL,
  generation_job_id UUID REFERENCES generation_jobs(id) ON DELETE SET NULL,
  
  -- Activity Details
  action VARCHAR(100) NOT NULL, -- 'account_created', 'login', 'account_deleted', etc.
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  
  -- Additional metadata (JSON format)
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- SYSTEM_SETTINGS TABLE - ตารางการตั้งค่าระบบ
-- ===================================
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Setting Details
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  
  -- Permissions
  is_public BOOLEAN DEFAULT FALSE, -- สามารถอ่านได้โดยไม่ต้อง login
  is_editable BOOLEAN DEFAULT TRUE, -- สามารถแก้ไขได้
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- API_KEYS TABLE - ตารางสำหรับ API Keys
-- ===================================
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- API Key Details
  key_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  api_secret_hash TEXT, -- hashed secret
  
  -- Permissions
  permissions JSONB DEFAULT '[]', -- array of permissions
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================
-- NOTIFICATIONS TABLE - ตารางการแจ้งเตือน
-- ===================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification Details
  type VARCHAR(50) NOT NULL, -- 'account_created', 'job_completed', 'system_alert'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  is_sms_sent BOOLEAN DEFAULT FALSE,
  
  -- Additional data
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- ===================================
-- INDEXES for Performance
-- ===================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- SMS Accounts indexes
CREATE INDEX idx_sms_accounts_user_id ON sms_accounts(user_id);
CREATE INDEX idx_sms_accounts_username ON sms_accounts(username);
CREATE INDEX idx_sms_accounts_status ON sms_accounts(status);
CREATE INDEX idx_sms_accounts_created_at ON sms_accounts(created_at);

-- Generation Jobs indexes
CREATE INDEX idx_generation_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_generation_jobs_priority ON generation_jobs(priority);
CREATE INDEX idx_generation_jobs_created_at ON generation_jobs(created_at);

-- Activity Logs indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ===================================
-- FUNCTIONS for automatic updated_at
-- ===================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_accounts_updated_at BEFORE UPDATE ON sms_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generation_jobs_updated_at BEFORE UPDATE ON generation_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- Row Level Security (RLS) Setup
-- ===================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_policy ON users FOR ALL 
  USING (auth.uid() = id);

-- SMS Accounts: users can only see their own accounts
CREATE POLICY sms_accounts_policy ON sms_accounts FOR ALL 
  USING (auth.uid() = user_id);

-- Generation Jobs: users can only see their own jobs
CREATE POLICY generation_jobs_policy ON generation_jobs FOR ALL 
  USING (auth.uid() = user_id);

-- Activity Logs: users can only see their own logs
CREATE POLICY activity_logs_policy ON activity_logs FOR ALL 
  USING (auth.uid() = user_id);

-- Notifications: users can only see their own notifications
CREATE POLICY notifications_policy ON notifications FOR ALL 
  USING (auth.uid() = user_id);

-- API Keys: users can only see their own API keys
CREATE POLICY api_keys_policy ON api_keys FOR ALL 
  USING (auth.uid() = user_id);

-- Admin policy for system_settings (public readable, admin writable)
CREATE POLICY system_settings_read_policy ON system_settings FOR SELECT 
  USING (is_public = TRUE OR auth.jwt()->>'role' = 'admin');

CREATE POLICY system_settings_write_policy ON system_settings FOR INSERT, UPDATE, DELETE
  USING (auth.jwt()->>'role' = 'admin');

-- ===================================
-- COMMENTS for Documentation
-- ===================================

COMMENT ON TABLE users IS 'ตารางผู้ใช้งานระบบ SMS Auto-Bot';
COMMENT ON TABLE sms_accounts IS 'ตาราง SMS Sub Accounts ที่สร้างผ่านระบบ';
COMMENT ON TABLE generation_jobs IS 'ตารางงานสร้าง SMS Account พร้อม progress tracking';
COMMENT ON TABLE activity_logs IS 'ตารางบันทึกกิจกรรมของผู้ใช้งานและระบบ';
COMMENT ON TABLE system_settings IS 'ตารางการตั้งค่าระบบและ configuration';
COMMENT ON TABLE api_keys IS 'ตาราง API Keys สำหรับการเชื่อมต่อภายนอก';
COMMENT ON TABLE notifications IS 'ตารางการแจ้งเตือนแบบ real-time';

-- ===================================
-- INSERT DEFAULT SYSTEM SETTINGS
-- ===================================

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('app_name', 'SMS Auto-Bot System', 'string', 'ชื่อแอปพลิเคชัน', TRUE),
('app_version', '1.0.0', 'string', 'เวอร์ชันแอปพลิเคชัน', TRUE),
('max_account_per_user', '10', 'number', 'จำนวน SMS Account สูงสุดต่อผู้ใช้', FALSE),
('account_creation_timeout', '60', 'number', 'Timeout การสร้าง Account (วินาที)', FALSE),
('max_retry_attempts', '3', 'number', 'จำนวนครั้งสูงสุดในการลองใหม่', FALSE),
('batch_size_limit', '5', 'number', 'จำนวนสูงสุดสำหรับ batch creation', FALSE),
('maintenance_mode', 'false', 'boolean', 'โหมดปิดปรับปรุงระบบ', TRUE),
('sms_website_url', 'https://web.smsup-plus.com', 'string', 'URL ของเว็บไซต์ SMS หลัก', FALSE),
('admin_credentials', '{"username":"Landingpage","password_hash":"hashed"}', 'json', 'ข้อมูล Admin สำหรับเข้าระบบ SMS', FALSE),
('notification_email_enabled', 'true', 'boolean', 'เปิดใช้งานการแจ้งเตือนทาง Email', FALSE),
('rate_limit_per_hour', '100', 'number', 'จำกัดจำนวน request ต่อชั่วโมง', FALSE),
('password_min_length', '12', 'number', 'ความยาวขั้นต่ำของรหัสผ่าน', TRUE);