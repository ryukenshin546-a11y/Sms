# Fix Profiles RLS Policies Script
Write-Host "🔧 Fixing Profiles RLS Policies..." -ForegroundColor Green

# Load environment variables
if (Test-Path "supabase\.env") {
    Get-Content "supabase\.env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

$supabaseUrl = $env:VITE_SUPABASE_URL

if (!$supabaseUrl) {
    Write-Host "❌ Error: Missing VITE_SUPABASE_URL in environment" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Supabase URL: $supabaseUrl" -ForegroundColor Blue

# Read the SQL file
$sqlContent = Get-Content "database\fix_profiles_rls.sql" -Raw

Write-Host "📄 SQL Content Preview:" -ForegroundColor Yellow
Write-Host $sqlContent.Substring(0, [Math]::Min(200, $sqlContent.Length)) -ForegroundColor Gray
Write-Host "..." -ForegroundColor Gray

Write-Host "`n💡 Please run this SQL manually in Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "1. Go to: https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc/sql" -ForegroundColor Gray
Write-Host "2. Copy content from: database\fix_profiles_rls.sql" -ForegroundColor Gray
Write-Host "3. Paste and click 'Run'" -ForegroundColor Gray
Write-Host "4. Test registration again" -ForegroundColor Gray

Write-Host "`n🎯 What this fix does:" -ForegroundColor Cyan
Write-Host "- Recreates RLS policies for profiles table" -ForegroundColor Gray
Write-Host "- Allows authenticated users to INSERT their own profile" -ForegroundColor Gray  
Write-Host "- Fixes 'permission denied' error during registration" -ForegroundColor Gray
Write-Host "- Maintains security by user-specific access control" -ForegroundColor Gray

Write-Host "`n🧪 After running the SQL, test:" -ForegroundColor Yellow
Write-Host "- Try registering a new user" -ForegroundColor Gray
Write-Host "- Check that no 401/permission denied errors occur" -ForegroundColor Gray
Write-Host "- Verify profile data is saved correctly" -ForegroundColor Gray