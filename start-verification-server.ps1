# Start Email Verification Server
Write-Host "🚀 Starting SMS Email Verification Server..." -ForegroundColor Green

# Navigate to server directory
Set-Location "server"

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
    npm install
}

# Load environment variables
if (Test-Path "../supabase/.env") {
    Write-Host "📄 Loading environment variables from ../supabase/.env" -ForegroundColor Blue
    Get-Content "../supabase/.env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "⚠️ Warning: ../supabase/.env file not found" -ForegroundColor Yellow
}

# Set server-specific environment variables
$env:NODE_ENV = "development"
$env:SERVER_PORT = "3001"
$env:CLIENT_URL = "http://localhost:2020"

Write-Host "🔧 Server configuration:" -ForegroundColor Cyan
Write-Host "  Port: $env:SERVER_PORT" -ForegroundColor Gray
Write-Host "  Client URL: $env:CLIENT_URL" -ForegroundColor Gray
Write-Host "  Supabase URL: $env:VITE_SUPABASE_URL" -ForegroundColor Gray

# Start the server
Write-Host "🌟 Starting server on http://localhost:$env:SERVER_PORT" -ForegroundColor Green
npm run dev