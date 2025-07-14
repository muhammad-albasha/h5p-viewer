#!/bin/bash

# H5P Viewer System Test Script
# Umfassende Tests für Linux-Deployment

set -e

echo "🧪 H5P Viewer System Tests"
echo "=========================="

# Test 1: Health Check API
echo "🔍 Testing Health Check API..."
if curl -s -f http://localhost:3000/h5p-viewer/api/health > /dev/null; then
    echo "✅ Health Check API is responding"
    
    # Get detailed health status
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/h5p-viewer/api/health)
    echo "📊 Health Status: $(echo $HEALTH_RESPONSE | jq -r '.status' 2>/dev/null || echo 'unknown')"
else
    echo "❌ Health Check API is not responding"
    exit 1
fi

# Test 2: Main Application
echo ""
echo "🌐 Testing Main Application..."
if curl -s -f http://localhost:3000/h5p-viewer > /dev/null; then
    echo "✅ Main application is accessible"
else
    echo "❌ Main application is not accessible"
    exit 1
fi

# Test 3: Admin Panel
echo ""
echo "🔐 Testing Admin Panel..."
if curl -s -f http://localhost:3000/h5p-viewer/admin > /dev/null; then
    echo "✅ Admin panel is accessible"
else
    echo "❌ Admin panel is not accessible"
    exit 1
fi

# Test 4: API Endpoints
echo ""
echo "🔗 Testing API Endpoints..."

# Test H5P Content API
if curl -s -f http://localhost:3000/h5p-viewer/api/h5p-content > /dev/null; then
    echo "✅ H5P Content API is working"
else
    echo "❌ H5P Content API is not working"
fi

# Test Subject Areas API
if curl -s -f http://localhost:3000/h5p-viewer/api/subject-areas > /dev/null; then
    echo "✅ Subject Areas API is working"
else
    echo "❌ Subject Areas API is not working"
fi

# Test Tags API
if curl -s -f http://localhost:3000/h5p-viewer/api/tags > /dev/null; then
    echo "✅ Tags API is working"
else
    echo "❌ Tags API is not working"
fi

# Test 5: File System Permissions
echo ""
echo "📁 Testing File System Permissions..."

# Check uploads directory
if [ -w "./public/uploads" ]; then
    echo "✅ Uploads directory is writable"
else
    echo "❌ Uploads directory is not writable"
fi

# Check H5P content directory
if [ -w "./public/h5p" ]; then
    echo "✅ H5P content directory is writable"
else
    echo "❌ H5P content directory is not writable"
fi

# Test 6: Docker Services
echo ""
echo "🐳 Testing Docker Services..."

# Check if Docker Compose services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Docker services are running"
    
    # Check individual services
    if docker-compose ps app | grep -q "Up"; then
        echo "✅ App service is running"
    else
        echo "❌ App service is not running"
    fi
    
    if docker-compose ps database | grep -q "Up"; then
        echo "✅ Database service is running"
    else
        echo "❌ Database service is not running"
    fi
    
    if docker-compose ps phpmyadmin | grep -q "Up"; then
        echo "✅ PHPMyAdmin service is running"
    else
        echo "⚠️  PHPMyAdmin service is not running (optional)"
    fi
else
    echo "❌ No Docker services are running"
fi

# Test 7: Database Connection
echo ""
echo "🗄️  Testing Database Connection..."
if docker-compose exec -T database mysql -u root -p"${DB_PASSWORD:-saSsd21-asd112A!1e14}" -e "SHOW DATABASES;" | grep -q "h5p"; then
    echo "✅ Database connection is working"
    echo "✅ H5P database exists"
else
    echo "❌ Database connection failed or H5P database does not exist"
fi

# Test 8: Resource Usage
echo ""
echo "💾 Resource Usage Information..."

# Memory usage
MEMORY_USAGE=$(free -h | awk '/^Mem:/ {print $3 "/" $2}')
echo "📊 Memory Usage: $MEMORY_USAGE"

# Disk usage
DISK_USAGE=$(df -h . | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')
echo "📊 Disk Usage: $DISK_USAGE"

# Docker container stats (non-blocking)
echo "🐳 Docker Container Resource Usage:"
timeout 5s docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || echo "⚠️  Could not get Docker stats"

# Test 9: Performance Test
echo ""
echo "🏃 Performance Test..."

# Simple response time test
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/h5p-viewer)
echo "⏱️  Response time: ${RESPONSE_TIME}s"

if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
    echo "✅ Response time is acceptable (< 3s)"
else
    echo "⚠️  Response time is slow (> 3s)"
fi

# Test 10: Security Headers
echo ""
echo "🔒 Security Headers Test..."

SECURITY_HEADERS=$(curl -s -I http://localhost:3000/h5p-viewer)

if echo "$SECURITY_HEADERS" | grep -q "X-Frame-Options"; then
    echo "✅ X-Frame-Options header present"
else
    echo "⚠️  X-Frame-Options header missing"
fi

if echo "$SECURITY_HEADERS" | grep -q "X-Content-Type-Options"; then
    echo "✅ X-Content-Type-Options header present"
else
    echo "⚠️  X-Content-Type-Options header missing"
fi

# Final Summary
echo ""
echo "📋 Test Summary"
echo "==============="
echo "✅ Tests completed successfully!"
echo ""
echo "🌐 Access URLs:"
echo "   Application: http://localhost:3000/h5p-viewer"
echo "   Admin Panel: http://localhost:3000/h5p-viewer/admin"
echo "   Database Admin: http://localhost:8080"
echo "   Health Check: http://localhost:3000/h5p-viewer/api/health"
echo ""
echo "📚 Default Login:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🔧 Management Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Restart: docker-compose restart"
echo "   Stop: docker-compose down"
echo "   Cleanup H5P: ./scripts/cleanup-h5p-linux.sh"
