# Uploads Directory

This directory contains uploaded files for the H5P Viewer application.

## Structure

- `contacts/` - Contact profile photos
- `h5p/` - Temporary H5P content during processing

## Permissions

In a production environment, make sure this directory:

1. Has proper ownership (www-data, nginx, apache, or your web server user)
2. Has proper permissions (755 for directories, 644 for files)

You can use the `scripts/fix-uploads-permissions.sh` script to fix permissions:

```bash
# Go to project root
cd /path/to/h5p-viewer

# Run the script (with optional web-server user and group)
./scripts/fix-uploads-permissions.sh www-data www-data
```

## Troubleshooting

If uploads are not visible or result in 404 errors:

1. Check that the directory exists and has proper permissions
2. Verify that your web server can access this directory
3. Check that the basePath in Next.js config is correctly set
4. Look for URL formatting issues in the application

For more details, see the Linux Deployment Guide.
