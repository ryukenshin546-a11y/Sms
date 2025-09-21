# Deploy SMS Account API Edge Function (Windows PowerShell)

Write-Host "🚀 Deploying SMS Account API Edge Function..." -ForegroundColor Green

try {
    # Deploy the function
    Write-Host "Deploying function to Supabase..." -ForegroundColor Yellow
    supabase functions deploy create-sms-account
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SMS Account API Edge Function deployed successfully!" -ForegroundColor Green
        
        # Show test information
        Write-Host "`n🧪 Testing Information:" -ForegroundColor Cyan
        Write-Host "You can test the function using curl or Postman:" -ForegroundColor White
        Write-Host ""
        Write-Host "curl -X POST 'https://your-project.supabase.co/functions/v1/create-sms-account' \" -ForegroundColor Gray
        Write-Host "  -H 'Authorization: Bearer YOUR_USER_TOKEN' \" -ForegroundColor Gray
        Write-Host "  -H 'Content-Type: application/json' \" -ForegroundColor Gray
        Write-Host "  -d '{\"creditAmount\": 100}'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📝 Notes:" -ForegroundColor Yellow
        Write-Host "- Replace 'your-project' with your actual Supabase project reference" -ForegroundColor White
        Write-Host "- Replace 'YOUR_USER_TOKEN' with a valid user JWT token from frontend" -ForegroundColor White
        Write-Host "- The function will use real user profile data from the authenticated user" -ForegroundColor White
        Write-Host "- SMS sender will be randomly selected from: Averin, Brivon, Clyrex" -ForegroundColor White
        
        Write-Host "`n🔧 Environment Variables Required:" -ForegroundColor Cyan
        Write-Host "- SUPABASE_URL (automatically set)" -ForegroundColor White
        Write-Host "- SUPABASE_SERVICE_ROLE_KEY (automatically set)" -ForegroundColor White
        
    } else {
        throw "Deployment failed with exit code $LASTEXITCODE"
    }
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTroubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Supabase CLI is installed and logged in" -ForegroundColor White
    Write-Host "2. Ensure you're in the correct project directory" -ForegroundColor White
    Write-Host "3. Check that the function code is valid TypeScript" -ForegroundColor White
    exit 1
}

Write-Host "`n🎉 Deployment completed!" -ForegroundColor Green