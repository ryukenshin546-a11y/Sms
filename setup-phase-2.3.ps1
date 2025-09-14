# Phase 2.3 Secrets Management Setup Script

Write-Host "🔒 Phase 2.3: Data Encryption และ Secrets Management Setup" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Step 1: Create .env file from template
Write-Host "`n📝 Step 1: Creating .env configuration file..." -ForegroundColor Green

if (-Not (Test-Path ".env")) {
    Copy-Item ".env.template" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Yellow
    Write-Host "⚠️  Please edit .env file with your actual values!" -ForegroundColor Red
} else {
    Write-Host "ℹ️  .env file already exists" -ForegroundColor Yellow
}

# Step 2: Generate encryption keys
Write-Host "`n🔐 Step 2: Generating secure encryption keys..." -ForegroundColor Green

# Generate 32-byte encryption key
$encryptionKey = -join ((1..64) | ForEach { '{0:X}' -f (Get-Random -Max 16) })
$jwtSecret = -join ((1..64) | ForEach { Get-Random -InputObject ([char[]]'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') })

Write-Host "Generated Encryption Key: $($encryptionKey.Substring(0,8))***" -ForegroundColor Yellow
Write-Host "Generated JWT Secret: $($jwtSecret.Substring(0,8))***" -ForegroundColor Yellow

# Step 3: Setup Supabase secrets (requires CLI)
Write-Host "`n📡 Step 3: Setting up Supabase secrets..." -ForegroundColor Green

$secrets = @{
    "SMS_UP_PLUS_USERNAME" = "Landingpage"
    "SMS_UP_PLUS_PASSWORD" = "@Atoz123" 
    "SMS_UP_PLUS_IP" = "58.8.213.44"
    "ENCRYPTION_KEY" = $encryptionKey
    "JWT_SECRET" = $jwtSecret
}

Write-Host "📋 Secrets to be configured:" -ForegroundColor Yellow
foreach ($secret in $secrets.Keys) {
    $value = $secrets[$secret]
    if ($value.Length -gt 8) {
        $maskedValue = $value.Substring(0, 4) + "***" + $value.Substring($value.Length - 4)
    } else {
        $maskedValue = "***"
    }
    Write-Host "  $secret = $maskedValue" -ForegroundColor White
}

# Create secrets setup commands
Write-Host "`n🚀 Step 4: Supabase secrets setup commands:" -ForegroundColor Green
Write-Host "Run these commands to set up secrets in Supabase:" -ForegroundColor Yellow

foreach ($secret in $secrets.Keys) {
    Write-Host "npx supabase secrets set $secret=`"$($secrets[$secret])`"" -ForegroundColor Cyan
}

# Step 4: Database encryption migration
Write-Host "`n🗃️  Step 5: Database encryption setup..." -ForegroundColor Green

$migrationContent = @"
-- Phase 2.3: Database Encryption Migration
-- Adds encryption support for sensitive data

-- Add encryption columns for phone numbers
ALTER TABLE otp_verifications 
ADD COLUMN IF NOT EXISTS encrypted_phone TEXT,
ADD COLUMN IF NOT EXISTS phone_hash TEXT;

-- Add encryption columns for verified phone numbers  
ALTER TABLE verified_phone_numbers
ADD COLUMN IF NOT EXISTS encrypted_phone TEXT,
ADD COLUMN IF NOT EXISTS phone_hash TEXT;

-- Create index for encrypted phone search
CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_hash ON otp_verifications(phone_hash);
CREATE INDEX IF NOT EXISTS idx_verified_phones_hash ON verified_phone_numbers(phone_hash);

-- Add encryption metadata
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS data_encrypted BOOLEAN DEFAULT FALSE;

-- Create encryption key management table
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) UNIQUE NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    CONSTRAINT encryption_keys_key_name_version_unique UNIQUE(key_name, key_version)
);

-- Enable RLS on encryption_keys table
ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

-- Only service role can access encryption keys
CREATE POLICY "Service role only" ON encryption_keys
    FOR ALL USING (auth.role() = 'service_role');

GRANT ALL ON encryption_keys TO service_role;

-- Insert initial encryption key metadata
INSERT INTO encryption_keys (key_name, key_version, is_active)
VALUES ('phone_encryption', 1, true)
ON CONFLICT (key_name, key_version) DO NOTHING;

-- Add comments
COMMENT ON TABLE encryption_keys IS 'Manages encryption key versions and metadata';
COMMENT ON COLUMN otp_verifications.encrypted_phone IS 'AES encrypted phone number';
COMMENT ON COLUMN otp_verifications.phone_hash IS 'SHA256 hash for phone number lookup';
"@

$migrationFile = "supabase\migrations\$(Get-Date -Format 'yyyyMMddHHmmss')_encryption_support.sql"
$migrationContent | Out-File -FilePath $migrationFile -Encoding UTF8

Write-Host "✅ Created encryption migration: $migrationFile" -ForegroundColor Yellow

# Step 5: Security checklist
Write-Host "`n✅ Step 6: Security implementation checklist:" -ForegroundColor Green

$checklist = @(
    "📝 Edit .env file with production values",
    "🔐 Set up Supabase secrets using the commands above", 
    "🗃️  Run database encryption migration",
    "🔒 Enable HTTPS in production",
    "🚫 Remove hard-coded secrets from code",
    "📊 Test encrypted phone number storage",
    "🔍 Validate security headers",
    "⚡ Test rate limiting with new config",
    "📋 Update audit logging for encryption events",
    "🎯 Deploy with environment-specific settings"
)

foreach ($item in $checklist) {
    Write-Host "  $item" -ForegroundColor White
}

# Step 6: Testing commands
Write-Host "`n🧪 Step 7: Testing commands:" -ForegroundColor Green

Write-Host @"
# Test environment variables
npx supabase secrets list

# Test encryption migration
npx supabase db push

# Test Edge Functions with new security
npx supabase functions deploy

# Test OTP with encrypted storage (PowerShell)
`$testBody = '{"phoneNumber":"0812345678","userId":"encrypt-test"}'
`$response = Invoke-RestMethod -Uri "https://mnhdueclyzwtfkmwttkc.supabase.co/functions/v1/otp-send-new" -Method Post -Body `$testBody -ContentType "application/json" -Headers @{"Authorization"="Bearer YOUR_ANON_KEY"}
"@ -ForegroundColor Cyan

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Complete the security setup checklist above" -ForegroundColor White
Write-Host "2. Test all functionality with encrypted data" -ForegroundColor White  
Write-Host "3. Deploy to staging environment first" -ForegroundColor White
Write-Host "4. Monitor audit logs for security events" -ForegroundColor White
Write-Host "5. Ready for Phase 3.1: OTP Resend Functionality" -ForegroundColor White

Write-Host "`n🎉 Phase 2.3 Security Setup Complete!" -ForegroundColor Green