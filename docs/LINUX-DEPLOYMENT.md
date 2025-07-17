# H5P Viewer - Linux Deployment Guide

## 🔧 Troubleshooting

### Häufige Probleme

1. **Port bereits belegt**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo kill -9 <PID>
   ```

2. **Berechtigungsprobleme**
   ```bash
   sudo chown -R $USER:$USER ./public
   chmod -R 755 ./public
   ```

3. **Uploads nicht sichtbar oder 404-Fehler bei Uploads**
   ```bash
   # Überprüfen Sie, ob die Upload-Verzeichnisse existieren
   mkdir -p ./public/uploads/contacts
   
   # Berechtigungen für Upload-Verzeichnisse korrekt setzen
   sudo chown -R www-data:www-data ./public/uploads
   chmod -R 775 ./public/uploads
   
   # Stellen Sie sicher, dass Ihr Webserver-Benutzer Schreibrechte hat
   sudo usermod -a -G www-data $USER
   ```

4. **Probleme mit Foto-Uploads**
   ```bash
   # Überprüfen Sie das Upload-Verzeichnis
   ls -la ./public/uploads/contacts
   
   # Stellen Sie sicher, dass die Dateien vom Webserver gelesen werden können
   find ./public/uploads -type f -exec chmod 644 {} \;
   find ./public/uploads -type d -exec chmod 755 {} \;
   
   # Neustart des Nginx/Apache wenn nötig
   sudo systemctl restart nginx  # oder apache2
   ```

Bei Problemen:

1. Überprüfen Sie die Logs: `docker-compose logs -f`
2. System-Status prüfen: `curl http://localhost:3000/h5p-viewer/api/health`
3. Server-Logs prüfen: `sudo tail -f /var/log/nginx/error.log` (für Nginx)
4. Dokumentation konsultieren
5. GitHub Issues erstellen

## 🔄 Updates

```bash
# Repository aktualisieren
git pull origin main

# Anwendung neu bauen und starten
docker-compose up -d

# Health-Check durchführen
npm run health:check
```
