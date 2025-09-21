# Execute SQL on Supabase Remote Database
Write-Host "🔧 Executing SIMPLE_CLEAN_FIX.sql on Supabase..." -ForegroundColor Cyan

# Read the SQL content
$sqlContent = Get-Content "C:\Users\Ryu\Documents\Sms\SIMPLE_CLEAN_FIX.sql" -Raw

# Create a temporary SQL file for execution
$tempSqlFile = "temp_fix.sql"
$sqlContent | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "📋 SQL Content to Execute:" -ForegroundColor Yellow
Write-Host $sqlContent -ForegroundColor Gray

Write-Host "`n🚀 Executing on remote database..." -ForegroundColor Green

try {
    # Execute the SQL on remote database
    & supabase db remote exec --file $tempSqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQL executed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ SQL execution failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error executing SQL: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Clean up temp file
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile -Force
    }
}

Write-Host "Now checking the results..." -ForegroundColor Cyan