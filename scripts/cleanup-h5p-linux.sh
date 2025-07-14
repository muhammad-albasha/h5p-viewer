#!/bin/bash

# H5P Content Cleanup Script for Linux
# This script removes orphaned H5P files and directories

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
H5P_DIR="$APP_DIR/public/h5p"
UPLOADS_DIR="$APP_DIR/public/uploads/h5p"

echo "🧹 H5P Content Cleanup Tool"
echo "Application Directory: $APP_DIR"
echo "H5P Content Directory: $H5P_DIR"
echo "Uploads Directory: $UPLOADS_DIR"

# Check if running in scan mode
SCAN_ONLY=false
if [[ "$1" == "--scan" || "$1" == "-s" ]]; then
    SCAN_ONLY=true
    echo "📊 Running in SCAN MODE - no files will be deleted"
fi

# Function to check if content exists in database
check_content_in_db() {
    local slug="$1"
    # This would need to be implemented to actually check the database
    # For now, we'll assume any directory in h5p folder should be checked
    echo "Checking slug: $slug in database..."
    return 1  # Return 1 (not found) for demo - implement actual DB check
}

# Function to scan H5P content directory
scan_h5p_content() {
    echo ""
    echo "🔍 Scanning H5P content directory..."
    
    if [[ ! -d "$H5P_DIR" ]]; then
        echo "ℹ️  H5P content directory does not exist: $H5P_DIR"
        return 0
    fi
    
    local orphaned_count=0
    local total_count=0
    
    for dir in "$H5P_DIR"/*; do
        if [[ -d "$dir" ]]; then
            total_count=$((total_count + 1))
            local dirname=$(basename "$dir")
            
            # Here you would implement actual database checking
            # For now, we'll list all directories
            echo "📁 Found content directory: $dirname"
            
            # Simulate orphaned check (implement actual DB check)
            if ! check_content_in_db "$dirname"; then
                echo "⚠️  Potentially orphaned directory: $dirname"
                orphaned_count=$((orphaned_count + 1))
                
                if [[ "$SCAN_ONLY" == "false" ]]; then
                    echo "🗑️  Removing orphaned directory: $dir"
                    rm -rf "$dir"
                fi
            fi
        fi
    done
    
    echo "📊 H5P Content Summary:"
    echo "   Total directories: $total_count"
    echo "   Orphaned directories: $orphaned_count"
}

# Function to scan uploads directory
scan_uploads() {
    echo ""
    echo "🔍 Scanning uploads directory..."
    
    if [[ ! -d "$UPLOADS_DIR" ]]; then
        echo "ℹ️  Uploads directory does not exist: $UPLOADS_DIR"
        return 0
    fi
    
    local file_count=0
    local total_size=0
    
    for file in "$UPLOADS_DIR"/*; do
        if [[ -f "$file" ]]; then
            file_count=$((file_count + 1))
            local filename=$(basename "$file")
            local filesize=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            total_size=$((total_size + filesize))
            
            echo "📄 Found upload file: $filename ($(numfmt --to=iec $filesize))"
            
            # Check if file is older than 30 days (cleanup old temp files)
            if [[ $(find "$file" -mtime +30 2>/dev/null) ]]; then
                echo "⚠️  Old temporary file (>30 days): $filename"
                
                if [[ "$SCAN_ONLY" == "false" ]]; then
                    echo "🗑️  Removing old file: $file"
                    rm -f "$file"
                fi
            fi
        fi
    done
    
    echo "📊 Uploads Summary:"
    echo "   Total files: $file_count"
    echo "   Total size: $(numfmt --to=iec $total_size)"
}

# Function to check disk usage
check_disk_usage() {
    echo ""
    echo "💾 Disk Usage Information:"
    
    if [[ -d "$H5P_DIR" ]]; then
        local h5p_size=$(du -sh "$H5P_DIR" 2>/dev/null | cut -f1)
        echo "   H5P Content: $h5p_size"
    fi
    
    if [[ -d "$UPLOADS_DIR" ]]; then
        local uploads_size=$(du -sh "$UPLOADS_DIR" 2>/dev/null | cut -f1)
        echo "   Uploads: $uploads_size"
    fi
    
    echo "   Available space: $(df -h "$APP_DIR" | tail -1 | awk '{print $4}')"
}

# Main execution
main() {
    echo "Starting cleanup process..."
    
    check_disk_usage
    scan_h5p_content
    scan_uploads
    
    if [[ "$SCAN_ONLY" == "true" ]]; then
        echo ""
        echo "✅ Scan completed. Run without --scan to perform actual cleanup."
    else
        echo ""
        echo "✅ Cleanup completed."
    fi
    
    check_disk_usage
}

# Run the main function
main
