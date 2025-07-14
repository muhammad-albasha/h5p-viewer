#!/bin/bash

# Linux Production Deployment Script für h5p-viewer

echo "🚀 Deploying h5p-viewer to Linux Production..."

# 1. Stop the service
echo "📱 Stopping service..."
sudo systemctl stop nextjs-h5p-viewer

# 2. Set correct permissions
echo "🔐 Setting file permissions..."
sudo chown -R vclass:vclass /var/www/app/h5p-viewer/
sudo chmod -R 755 /var/www/app/h5p-viewer/

# 3. Create required directories
echo "📁 Creating required directories..."
sudo -u vclass mkdir -p /var/www/app/h5p-viewer/public/uploads/h5p
sudo -u vclass mkdir -p /var/www/app/h5p-viewer/public/h5p
sudo -u vclass mkdir -p /var/www/app/h5p-viewer/public/uploads/contacts

# 4. Set directory permissions
echo "🔧 Setting directory permissions..."
sudo chmod 755 /var/www/app/h5p-viewer/public/
sudo chmod 755 /var/www/app/h5p-viewer/public/uploads/
sudo chmod 755 /var/www/app/h5p-viewer/public/uploads/h5p/
sudo chmod 755 /var/www/app/h5p-viewer/public/h5p/
sudo chmod 755 /var/www/app/h5p-viewer/public/uploads/contacts/

# 5. Install dependencies
echo "📦 Installing dependencies..."
cd /var/www/app/h5p-viewer/
sudo -u vclass npm ci --only=production

# 6. Build the application
echo "🔨 Building application..."
sudo -u vclass npm run build

# 7. Copy and update systemd service
echo "⚙️ Updating systemd service..."
sudo cp h5p-viewer-production.service /etc/systemd/system/nextjs-h5p-viewer.service

# 8. Reload systemd and start service
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload
sudo systemctl enable nextjs-h5p-viewer
sudo systemctl start nextjs-h5p-viewer

# 9. Check status
echo "✅ Checking service status..."
sudo systemctl status nextjs-h5p-viewer

echo "🎉 Deployment complete!"
echo "📋 To check logs: sudo journalctl -u nextjs-h5p-viewer -f"
echo "🌐 To check service: sudo systemctl status nextjs-h5p-viewer"
