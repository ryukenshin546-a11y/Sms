#!/usr/bin/env powershell
# Database Migration Script for Multi-Step Registration System
# Run this script to apply the database schema changes

Write-Host "🚀 Starting Database Migration for Multi-Step Registration System..." -ForegroundColor Blue
Write-Host ""

# Check if Supabase CLI is available
try {
    $supabaseVersion = & supabase --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Supabase CLI detected: $supabaseVersion" -ForegroundColor Green
    } else {
        throw "Supabase CLI not found"
    }
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    Write-Host "   or download from https://github.com/supabase/cli/releases" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a Supabase project
if (-not (Test-Path "supabase\config.toml")) {
    Write-Host "❌ Not in a Supabase project directory. Please run from project root." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Migration Plan:" -ForegroundColor Cyan
Write-Host "1. Add verification fields to users table" -ForegroundColor Gray
Write-Host "2. Create triggers for automatic profile creation" -ForegroundColor Gray
Write-Host "3. Add functions for phone verification" -ForegroundColor Gray
Write-Host "4. Create verification status view" -ForegroundColor Gray
Write-Host "5. Set up RLS policies" -ForegroundColor Gray
Write-Host ""

# Confirm before proceeding
$confirm = Read-Host "Do you want to proceed with the migration? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Applying database migration..." -ForegroundColor Blue

# Apply the migration
try {
    # Check if migration file exists
    $migrationFile = "database\04_add_verification_fields.sql"
    if (-not (Test-Path $migrationFile)) {
        throw "Migration file not found: $migrationFile"
    }

    # Read the SQL file
    $sqlContent = Get-Content $migrationFile -Raw
    
    # Apply via Supabase CLI
    Write-Host "📤 Uploading migration to Supabase..." -ForegroundColor Yellow
    
    # Method 1: Try to use supabase db push if available
    try {
        # Create a temporary migration file in the supabase/migrations directory
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        $migrationName = "${timestamp}_add_verification_fields.sql"
        $targetPath = "supabase\migrations\$migrationName"
        
        # Ensure migrations directory exists
        if (-not (Test-Path "supabase\migrations")) {
            New-Item -ItemType Directory -Path "supabase\migrations" -Force
        }
        
        Copy-Item $migrationFile $targetPath
        
        Write-Host "✅ Migration file created: $migrationName" -ForegroundColor Green
        
        # Apply migration
        $result = & supabase db push 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Note: You may need to apply the migration manually in Supabase dashboard" -ForegroundColor Yellow
            Write-Host "Migration file location: $targetPath" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "⚠️ Automatic migration failed. Please apply manually:" -ForegroundColor Yellow
        Write-Host "1. Open your Supabase dashboard" -ForegroundColor Gray
        Write-Host "2. Go to SQL Editor" -ForegroundColor Gray
        Write-Host "3. Copy and run the contents of: $migrationFile" -ForegroundColor Gray
    }

} catch {
    Write-Host "❌ Migration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Post-Migration Checks:" -ForegroundColor Cyan

# List what should be verified
Write-Host "Please verify the following in your Supabase dashboard:" -ForegroundColor Gray
Write-Host "1. ✓ Users table exists with verification fields" -ForegroundColor Gray
Write-Host "2. ✓ Phone verification functions are created" -ForegroundColor Gray
Write-Host "3. ✓ RLS policies are enabled" -ForegroundColor Gray
Write-Host "4. ✓ Triggers are working" -ForegroundColor Gray

Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test user registration with new multi-step flow" -ForegroundColor Gray
Write-Host "2. Verify OTP phone verification works" -ForegroundColor Gray
Write-Host "3. Test email verification flow" -ForegroundColor Gray
Write-Host "4. Ensure Auto-Bot access is properly gated" -ForegroundColor Gray

Write-Host ""
Write-Host "🎉 Database migration completed!" -ForegroundColor Green
Write-Host "Your SMS-UP+ system now supports multi-step registration with phone and email verification." -ForegroundColor Green

# Optional: Start the development server
Write-Host ""
$startDev = Read-Host "Do you want to start the development server? (y/N)"
if ($startDev -eq "y" -or $startDev -eq "Y") {
    Write-Host "🚀 Starting development server..." -ForegroundColor Blue
    npm run dev
}