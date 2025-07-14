# Fix für Linux Production Server

## 1. Environment File Check
# Die systemd Datei verwendet .env.local aber sollte .env.production verwenden
# Ändere in der .service Datei:
# EnvironmentFile=/var/www/app/h5p-viewer/.env.production

## 2. File Permissions für Linux
# Stelle sicher, dass diese Verzeichnisse existieren und die richtigen Permissions haben:
sudo mkdir -p /var/www/app/h5p-viewer/public/uploads/h5p
sudo mkdir -p /var/www/app/h5p-viewer/public/h5p
sudo chown -R vclass:vclass /var/www/app/h5p-viewer/public/
sudo chmod -R 755 /var/www/app/h5p-viewer/public/

## 3. Node.js Permissions
# Stelle sicher, dass der vclass User Schreibrechte hat:
sudo chown -R vclass:vclass /var/www/app/h5p-viewer/
sudo chmod -R 755 /var/www/app/h5p-viewer/

## 4. Systemd Service Reload
sudo systemctl daemon-reload
sudo systemctl restart nextjs-h5p-viewer
sudo systemctl status nextjs-h5p-viewer

## 5. Logs checken
sudo journalctl -u nextjs-h5p-viewer -f
