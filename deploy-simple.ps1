Write-Host "Preparing NDMA Training Platform for Render Deployment" -ForegroundColor Green

# Check if git is initialized
if (!(Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit: NDMA Training Platform"
}

Write-Host "Repository prepared for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub"
Write-Host "2. Go to https://render.com and create an account"
Write-Host "3. Click 'New +' -> 'Blueprint' and connect your GitHub repo"
Write-Host "4. The render.yaml file will automatically configure both services"
Write-Host ""
Write-Host "Your app will be available at:" -ForegroundColor Magenta
Write-Host "Frontend: https://ndma-training-client.onrender.com"
Write-Host "Backend API: https://ndma-training-server.onrender.com"