#!/bin/bash

# NDMA Training Platform - Render Deployment Script

echo "🚀 Preparing NDMA Training Platform for Render Deployment"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: NDMA Training Platform"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📄 Creating .gitignore file..."
    cat > .gitignore << EOF
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
EOF
fi

echo "✅ Repository prepared for deployment!"
echo ""
echo "🔗 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://render.com and create an account"
echo "3. Click 'New +' → 'Blueprint' and connect your GitHub repo"
echo "4. The render.yaml file will automatically configure both services"
echo ""
echo "📋 Manual deployment alternative:"
echo "1. Deploy Backend: New + → Web Service → Docker (./server directory)"
echo "2. Deploy Frontend: New + → Static Site → Build: 'cd client && npm install && npm run build'"
echo ""
echo "🌐 Your app will be available at:"
echo "Frontend: https://ndma-training-client.onrender.com"
echo "Backend API: https://ndma-training-server.onrender.com"