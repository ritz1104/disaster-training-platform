# NDMA Training Platform - Render Deployment Script (PowerShell)

Write-Host "🚀 Preparing NDMA Training Platform for Render Deployment" -ForegroundColor Green

# Check if git is initialized
if (!(Test-Path ".git")) {
    Write-Host "📝 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: NDMA Training Platform"
}

# Create .gitignore if it doesn't exist
if (!(Test-Path ".gitignore")) {
    Write-Host "📄 Creating .gitignore file..." -ForegroundColor Yellow
    
    $gitignore = @"
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development
.env.test

# Build outputs
dist/
build/
*/dist/
*/build/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
"@

    $gitignore | Out-File -FilePath ".gitignore" -Encoding utf8
}

Write-Host "✅ Repository prepared for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub"
Write-Host "2. Go to https://render.com and create an account"
Write-Host "3. Click 'New +' → 'Blueprint' and connect your GitHub repo"
Write-Host "4. The render.yaml file will automatically configure both services"
Write-Host ""
Write-Host "📋 Manual deployment alternative:" -ForegroundColor Cyan
Write-Host "1. Deploy Backend: New + → Web Service → Docker (./server directory)"
Write-Host "2. Deploy Frontend: New + → Static Site → Build: 'cd client && npm install && npm run build'"
Write-Host ""
Write-Host "🌐 Your app will be available at:" -ForegroundColor Magenta
Write-Host "Frontend: https://ndma-training-client.onrender.com"
Write-Host "Backend API: https://ndma-training-server.onrender.com"