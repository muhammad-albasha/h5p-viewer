#!/bin/bash

# H5P Viewer Linux Deployment Script
# This script sets up and runs the H5P Viewer application on a Linux server

set -e  # Exit on any error

echo "🚀 Starting H5P Viewer Linux Deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories with proper permissions
echo "📁 Creating necessary directories..."
mkdir -p ./public/h5p
mkdir -p ./public/uploads/h5p
mkdir -p ./public/uploads/contacts

# Set proper permissions for uploads and content directories
chmod -R 755 ./public/uploads
chmod -R 755 ./public/h5p

# Create environment file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "🔧 Creating environment configuration..."
    cat > .env.production << EOF
# Database Configuration
DB_HOST=database
DB_PORT=3306
DB_USER=root
DB_PASSWORD=saSsd21-asd112A!1e14
DB_NAME=h5p

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production-$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000/h5p-viewer

# Application Configuration
NODE_ENV=production
EOF
    echo "✅ Environment file created. Please review and update .env.production with your settings."
fi

# Build and start the application
echo "🔨 Building and starting the application..."

# Stop any existing containers
docker-compose down

# Build the application image
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Check if all services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test if the application is accessible
echo "🧪 Testing application accessibility..."
sleep 10

if curl -f -s http://localhost:3000/h5p-viewer > /dev/null; then
    echo "✅ Application is running successfully!"
    echo ""
    echo "🌐 Access your H5P Viewer at:"
    echo "   Application: http://localhost:3000/h5p-viewer"
    echo "   Admin Panel: http://localhost:3000/h5p-viewer/admin" 
    echo "   Database Admin: http://localhost:8080"
    echo ""
    echo "📋 Default admin credentials:"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo "⚠️  Remember to:"
    echo "   1. Change the default admin password"
    echo "   2. Update the NEXTAUTH_SECRET in .env.production"
    echo "   3. Set up proper SSL/TLS for production"
    echo "   4. Configure firewall rules"
else
    echo "❌ Application is not responding. Check the logs:"
    docker-compose logs app
fi

echo ""
echo "📊 View logs with: docker-compose logs -f"
echo "🛑 Stop services with: docker-compose down"
echo "🔄 Restart services with: docker-compose restart"
