#!/bin/bash

# Production deployment script for Disaster Training Platform

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Configuration
PROJECT_NAME="disaster-training-platform"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
DEPLOY_USER="deploy"
LOG_FILE="/var/log/$PROJECT_NAME/deploy.log"

# Create log directory
sudo mkdir -p "$(dirname "$LOG_FILE")"
sudo chown $USER:$USER "$(dirname "$LOG_FILE")"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

log "📋 Checking prerequisites..."

# Check required tools
for cmd in docker docker-compose git node npm; do
    if ! command_exists "$cmd"; then
        log "❌ Error: $cmd is not installed"
        exit 1
    fi
done

log "✅ All prerequisites satisfied"

# Backup existing data
log "💾 Creating backup..."
mkdir -p "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
if [ -f "docker-compose.yml" ]; then
    docker-compose exec mongodb mongodump --out "/tmp/backup" || true
    docker cp $(docker-compose ps -q mongodb):/tmp/backup "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/" || true
fi

# Pull latest code
log "📥 Pulling latest code..."
git pull origin main

# Set environment variables
log "⚙️  Setting up environment..."
if [ ! -f "server/.env" ]; then
    cp server/.env.production server/.env
    log "📝 Please update server/.env with your production values"
fi

if [ ! -f "client/.env" ]; then
    cp client/.env.production client/.env
    log "📝 Please update client/.env with your production values"
fi

# Build and start services
log "🏗️  Building containers..."
docker-compose down --remove-orphans
docker-compose build --no-cache

log "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
log "⏳ Waiting for services to be ready..."
sleep 30

# Health checks
log "🏥 Performing health checks..."
for i in {1..10}; do
    if docker-compose exec server curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
        log "✅ Server is healthy"
        break
    fi
    if [ $i -eq 10 ]; then
        log "❌ Server health check failed"
        docker-compose logs server
        exit 1
    fi
    sleep 5
done

for i in {1..10}; do
    if docker-compose exec client curl -f http://localhost/ >/dev/null 2>&1; then
        log "✅ Client is healthy"
        break
    fi
    if [ $i -eq 10 ]; then
        log "❌ Client health check failed"
        docker-compose logs client
        exit 1
    fi
    sleep 5
done

# Database migration/seeding (if needed)
log "🌱 Running database migrations..."
docker-compose exec server npm run seed:prod || true

# SSL Certificate setup (if needed)
if [ "$1" = "--ssl" ]; then
    log "🔒 Setting up SSL certificates..."
    # Add SSL certificate setup logic here
    # This could use certbot, manual certificates, etc.
fi

# Cleanup old images
log "🧹 Cleaning up old Docker images..."
docker image prune -f

# Show running services
log "📊 Deployment status:"
docker-compose ps

# Display useful information
log "🎉 Deployment completed successfully!"
log "📍 Application URLs:"
log "   Frontend: http://localhost"
log "   Backend API: http://localhost:5000/api"
log "   Admin Panel: http://localhost/dashboard"
log ""
log "📝 Important post-deployment tasks:"
log "   1. Update DNS records to point to this server"
log "   2. Configure SSL certificates for HTTPS"
log "   3. Set up monitoring and alerting"
log "   4. Configure backup schedules"
log "   5. Review security settings"
log ""
log "📚 View logs with: docker-compose logs -f [service]"
log "🔄 Restart services with: docker-compose restart"
log "🛑 Stop services with: docker-compose down"