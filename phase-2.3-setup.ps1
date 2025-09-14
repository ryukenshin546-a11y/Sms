# Phase 2.3: Data Encryption และ Secrets Management Setup

Write-Host "Phase 2.3: Data Encryption Security Setup" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Step 1: Generate secure keys
Write-Host "`nGenerating encryption keys..." -ForegroundColor Green
$encryptionKey = -join ((1..64) | ForEach { '{0:X}' -f (Get-Random -Max 16) })
$jwtSecret = -join ((1..32) | ForEach { Get-Random -InputObject ([char[]]'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') })

Write-Host "Encryption Key: $($encryptionKey.Substring(0,8))***" -ForegroundColor Yellow
Write-Host "JWT Secret: $($jwtSecret.Substring(0,8))***" -ForegroundColor Yellow

# Step 2: Create .env file
Write-Host "`nCreating .env configuration..." -ForegroundColor Green
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.template" ".env"
    Write-Host "Created .env from template" -ForegroundColor Yellow
    Write-Host "Please edit .env with your values!" -ForegroundColor Red
} else {
    Write-Host ".env file already exists" -ForegroundColor Yellow
}

# Step 3: Supabase secrets setup
Write-Host "`nSupabase Secrets Setup Commands:" -ForegroundColor Green
Write-Host "Run these commands:" -ForegroundColor Yellow

$secrets = @{
    "SMS_UP_PLUS_USERNAME" = "Landingpage"
    "SMS_UP_PLUS_PASSWORD" = "@Atoz123"
    "SMS_UP_PLUS_IP" = "58.8.213.44"
    "ENCRYPTION_KEY" = $encryptionKey
    "JWT_SECRET" = $jwtSecret
}

foreach ($key in $secrets.Keys) {
    Write-Host "npx supabase secrets set $key=`"$($secrets[$key])`"" -ForegroundColor Cyan
}

# Step 4: Database migration
Write-Host "`nCreating encryption migration..." -ForegroundColor Green

$migrationContent = @"
-- Phase 2.3: Database Encryption Support
-- Date: $(Get-Date -Format 'yyyy-MM-dd')

-- Add encryption support to existing tables
ALTER TABLE otp_verifications 
ADD COLUMN IF NOT EXISTS encrypted_phone TEXT,
ADD COLUMN IF NOT EXISTS phone_hash TEXT;

ALTER TABLE verified_phone_numbers
ADD COLUMN IF NOT EXISTS encrypted_phone TEXT,
ADD COLUMN IF NOT EXISTS phone_hash TEXT;

-- Indexes for encrypted phone lookup
CREATE INDEX IF NOT EXISTS idx_otp_phone_hash ON otp_verifications(phone_hash);
CREATE INDEX IF NOT EXISTS idx_verified_phone_hash ON verified_phone_numbers(phone_hash);

-- Mark audit logs as encrypted
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS data_encrypted BOOLEAN DEFAULT FALSE;

-- Comments
COMMENT ON COLUMN otp_verifications.encrypted_phone IS 'AES-256 encrypted phone number';
COMMENT ON COLUMN otp_verifications.phone_hash IS 'SHA-256 hash for phone search';
"@

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationFile = "supabase/migrations/${timestamp}_encryption_support.sql"
$migrationContent | Out-File -FilePath $migrationFile -Encoding UTF8

Write-Host "Created migration: $migrationFile" -ForegroundColor Yellow

# Step 5: Security checklist
Write-Host "`nSecurity Implementation Checklist:" -ForegroundColor Green
$checklist = @(
    "Edit .env file with production values",
    "Run Supabase secrets commands above", 
    "Apply database migration: npx supabase db push",
    "Deploy functions: npx supabase functions deploy",
    "Test encrypted phone storage",
    "Validate security headers",
    "Monitor audit logs"
)

$i = 1
foreach ($item in $checklist) {
    Write-Host "$i. $item" -ForegroundColor White
    $i++
}

Write-Host "`nPhase 2.3 Security Setup Ready!" -ForegroundColor Green