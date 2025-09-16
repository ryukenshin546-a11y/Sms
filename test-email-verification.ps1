# Test Email Verification Complete Flow
Write-Host "🧪 Testing Email Verification Flow..." -ForegroundColor Green

# Load environment variables
if (Test-Path "supabase\.env") {
    Get-Content "supabase\.env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$supabaseUrl = $env:VITE_SUPABASE_URL
$serviceKey = $env:VITE_SUPABASE_SERVICE_KEY

if (!$supabaseUrl -or !$serviceKey) {
    Write-Host "❌ Error: Missing environment variables" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Checking current user email verification status..." -ForegroundColor Blue

try {
    # Headers for API requests
    $headers = @{
        'apikey' = $serviceKey
        'Authorization' = "Bearer $serviceKey"
        'Content-Type' = 'application/json'
    }
    
    # Get current user data from auth.users
    Write-Host "📊 Fetching auth.users data..." -ForegroundColor Yellow
    $authUsers = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/auth.users?select=id,email,email_confirmed_at" -Headers $headers
    
    if ($authUsers.Count -gt 0) {
        Write-Host "✅ Found $($authUsers.Count) users in auth.users:" -ForegroundColor Green
        foreach ($user in $authUsers) {
            Write-Host "  User: $($user.email) | Confirmed: $($user.email_confirmed_at -ne $null)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ No users found in auth.users" -ForegroundColor Yellow
    }
    
    # Get profiles data
    Write-Host "`n📊 Fetching profiles data..." -ForegroundColor Yellow
    $profiles = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/profiles?select=id,email,email_verified" -Headers $headers
    
    if ($profiles.Count -gt 0) {
        Write-Host "✅ Found $($profiles.Count) users in profiles:" -ForegroundColor Green
        foreach ($profile in $profiles) {
            Write-Host "  User: $($profile.email) | Verified: $($profile.email_verified)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ No users found in profiles" -ForegroundColor Yellow
    }
    
    # Compare and identify mismatches
    Write-Host "`n🔍 Checking for sync mismatches..." -ForegroundColor Blue
    
    $mismatches = @()
    foreach ($authUser in $authUsers) {
        $profile = $profiles | Where-Object { $_.id -eq $authUser.id }
        if ($profile) {
            $authVerified = ($authUser.email_confirmed_at -ne $null)
            $profileVerified = $profile.email_verified
            
            if ($authVerified -ne $profileVerified) {
                $mismatches += @{
                    email = $authUser.email
                    auth_verified = $authVerified
                    profile_verified = $profileVerified
                }
            }
        }
    }
    
    if ($mismatches.Count -gt 0) {
        Write-Host "❌ Found $($mismatches.Count) sync mismatches:" -ForegroundColor Red
        foreach ($mismatch in $mismatches) {
            Write-Host "  Email: $($mismatch.email)" -ForegroundColor Red
            Write-Host "    auth.users verified: $($mismatch.auth_verified)" -ForegroundColor Red
            Write-Host "    profiles verified: $($mismatch.profile_verified)" -ForegroundColor Red
        }
        
        Write-Host "`n💡 Run sync script to fix mismatches:" -ForegroundColor Yellow
        Write-Host ".\sync-email-verification.ps1" -ForegroundColor Gray
    } else {
        Write-Host "✅ All email verification statuses are in sync!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Error checking verification status:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎯 Next steps:" -ForegroundColor Cyan
Write-Host "1. If mismatches found, run: .\sync-email-verification.ps1" -ForegroundColor Gray
Write-Host "2. Test magic link verification again" -ForegroundColor Gray
Write-Host "3. Check that profiles.email_verified updates after verification" -ForegroundColor Gray