# H5P Viewer - Linux Deployment Guide

## 🔧 Troubleshooting

### Häufige Probleme

1. **Port bereits belegt**
   ```bash
   sudo netstat -tulpn | grep :3000
   sudo kill -9 <PID>
   ```

2. **Berechtigensprobleme**
   ```bash
   sudo chown -R $USER:$USER ./public
   chmod -R 755 ./public
   ```

Bei Problemen:

1. Überprüfen Sie die Logs: `docker-compose logs -f`
2. System-Status prüfen: `curl http://localhost:3000/h5p-viewer/api/health`
3. Dokumentation konsultieren
4. GitHub Issues erstellen

## 🔄 Updates

```bash
# Repository aktualisieren
git pull origin main

# Anwendung neu bauen und starten
docker-compose up -d

# Health-Check durchführen
npm run health:check
```
