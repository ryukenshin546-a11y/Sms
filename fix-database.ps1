Write-Host "🚨 FIXING DATABASE - Restoring user_profiles table" -ForegroundColor Red

$restoreSQL = Get-Content "C:\Users\Ryu\Documents\Sms\restore_user_profiles.sql" -Raw

Write-Host "📋 Please run this SQL in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "🔗 Dashboard: https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc/sql" -ForegroundColor Cyan

Write-Host "`n--- COPY AND PASTE THIS SQL ---" -ForegroundColor Green
Write-Host $restoreSQL -ForegroundColor White
Write-Host "--- END SQL ---`n" -ForegroundColor Green

Write-Host "⚠️  IMPORTANT STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to Supabase Dashboard > SQL Editor" -ForegroundColor White
Write-Host "2. Paste the SQL above" -ForegroundColor White
Write-Host "3. Click 'Run'" -ForegroundColor White
Write-Host "4. Come back here when done" -ForegroundColor White

Write-Host "`n💡 This will recreate:" -ForegroundColor Cyan
Write-Host "   - user_profiles table with all columns" -ForegroundColor White
Write-Host "   - RLS policies for security" -ForegroundColor White
Write-Host "   - Indexes for performance" -ForegroundColor White
Write-Host "   - Triggers for auto-registration" -ForegroundColor White