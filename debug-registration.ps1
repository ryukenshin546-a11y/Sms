# Debug Registration Flow
Write-Host "🔍 Debugging Registration Flow..." -ForegroundColor Green

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

$headers = @{
    'apikey' = $serviceKey
    'Authorization' = "Bearer $serviceKey"
    'Content-Type' = 'application/json'
}

Write-Host "1. Checking recent auth.users entries..." -ForegroundColor Blue
try {
    $authUsers = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/auth.users?select=id,email,created_at&order=created_at.desc&limit=5" -Headers $headers
    
    if ($authUsers.Count -gt 0) {
        Write-Host "✅ Recent users in auth.users:" -ForegroundColor Green
        foreach ($user in $authUsers) {
            $createdAt = [DateTime]::Parse($user.created_at).ToString("yyyy-MM-dd HH:mm:ss")
            Write-Host "  ID: $($user.id.Substring(0,8))... | Email: $($user.email) | Created: $createdAt" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error checking auth.users: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Checking recent profiles entries..." -ForegroundColor Blue
try {
    $profiles = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/profiles?select=id,email,username,created_at&order=created_at.desc&limit=5" -Headers $headers
    
    if ($profiles.Count -gt 0) {
        Write-Host "✅ Recent profiles:" -ForegroundColor Green
        foreach ($profile in $profiles) {
            $createdAt = [DateTime]::Parse($profile.created_at).ToString("yyyy-MM-dd HH:mm:ss")
            Write-Host "  ID: $($profile.id.Substring(0,8))... | Email: $($profile.email) | User: $($profile.username) | Created: $createdAt" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error checking profiles: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Looking for orphaned profiles (profiles without auth.users)..." -ForegroundColor Blue
try {
    # This would need a more complex query, but let's check counts
    $authCount = (Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/auth.users?select=id" -Headers $headers).Count
    $profilesCount = (Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/profiles?select=id" -Headers $headers).Count
    
    Write-Host "📊 Count comparison:" -ForegroundColor Yellow
    Write-Host "  auth.users count: $authCount" -ForegroundColor Gray
    Write-Host "  profiles count: $profilesCount" -ForegroundColor Gray
    
    if ($profilesCount -eq $authCount) {
        Write-Host "✅ Counts match - likely no orphaned profiles" -ForegroundColor Green
    } elseif ($profilesCount -gt $authCount) {
        Write-Host "⚠️ More profiles than auth users - possible orphaned profiles" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ More auth users than profiles - missing profiles" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error checking counts: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Next steps:" -ForegroundColor Cyan
Write-Host "- Run check_triggers_and_functions.sql to check for auto-creation triggers" -ForegroundColor Gray
Write-Host "- Try registration with a completely new email address" -ForegroundColor Gray
Write-Host "- Check Supabase Dashboard > Auth > Users for recent entries" -ForegroundColor Gray