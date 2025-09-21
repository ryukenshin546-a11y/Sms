Write-Host "🚨 COMPLETE REGISTRATION SYSTEM FIX" -ForegroundColor Red

Write-Host "`n📋 STEP 1: Run the complete fix in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "🔗 Dashboard: https://supabase.com/dashboard/project/mnhdueclyzwtfkmwttkc/sql" -ForegroundColor Cyan

$fixSQL = Get-Content "C:\Users\Ryu\Documents\Sms\COMPLETE_REGISTRATION_FIX.sql" -Raw

Write-Host "`n--- COPY AND PASTE THIS COMPLETE SQL ---" -ForegroundColor Green
Write-Host $fixSQL -ForegroundColor White
Write-Host "--- END COMPLETE SQL ---`n" -ForegroundColor Green

Write-Host "⚠️  CRITICAL STEPS:" -ForegroundColor Yellow
Write-Host "1. Go to Supabase Dashboard > SQL Editor" -ForegroundColor White
Write-Host "2. Paste the COMPLETE SQL above" -ForegroundColor White
Write-Host "3. Click 'Run'" -ForegroundColor White
Write-Host "4. Test registration with a NEW email address" -ForegroundColor White
Write-Host "5. Check if user_profiles table gets the data" -ForegroundColor White

Write-Host "`n🔧 What this fixes:" -ForegroundColor Cyan
Write-Host "   ✅ Creates user_profiles table with ALL fields" -ForegroundColor Green
Write-Host "   ✅ Fixes handle_new_user() trigger function" -ForegroundColor Green
Write-Host "   ✅ Handles both personal and corporate accounts" -ForegroundColor Green
Write-Host "   ✅ Ensures unique usernames" -ForegroundColor Green
Write-Host "   ✅ Proper RLS policies" -ForegroundColor Green
Write-Host "   ✅ Proper permissions" -ForegroundColor Green

Write-Host "`n🧪 After running SQL - TEST:" -ForegroundColor Magenta
Write-Host "   1. Try registering with a NEW email" -ForegroundColor White
Write-Host "   2. Check if data appears in user_profiles table" -ForegroundColor White
Write-Host "   3. Try logging in with the new account" -ForegroundColor White