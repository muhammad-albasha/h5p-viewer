# H5P Viewer - Linux Deployment Guide

Dieses Dokument beschreibt die Bereitstellung der H5P Viewer Anwendung auf Linux-Servern.

## 🚀 Schnellstart

### Voraussetzungen

- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM (mindestens)
- 10GB freier Speicherplatz

### Automatische Installation

```bash
# Repository klonen
git clone <repository-url>
cd h5p-viewer

# Executable-Berechtigung setzen
chmod +x deploy-linux.sh

# Automatisches Deployment starten
./deploy-linux.sh
```

## 🔧 Manuelle Installation

### 1. Abhängigkeiten installieren

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin curl

# CentOS/RHEL
sudo dnf install docker docker-compose curl
sudo systemctl start docker
sudo systemctl enable docker

# Benutzer zur Docker-Gruppe hinzufügen
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Anwendung konfigurieren

```bash
# Verzeichnisse erstellen
mkdir -p ./public/h5p
mkdir -p ./public/uploads/h5p
mkdir -p ./public/uploads/contacts

# Berechtigungen setzen
chmod -R 755 ./public
```

### 3. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.production` Datei:

```bash
# Database Configuration
DB_HOST=database
DB_PORT=3306
DB_USER=root
DB_PASSWORD=IhrStarkesPasswort
DB_NAME=h5p

# NextAuth Configuration  
NEXTAUTH_SECRET=IhrSuperGeheimerSchlüssel
NEXTAUTH_URL=https://ihre-domain.com/h5p-viewer

# Application Configuration
NODE_ENV=production
```

### 4. Anwendung starten

```bash
# Build und Start
docker-compose build --no-cache
docker-compose up -d

# Status überprüfen
docker-compose ps
docker-compose logs -f app
```

## 🌐 Nginx-Konfiguration (Empfohlen)

### Installation

```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL
sudo dnf install nginx
```

### Konfiguration

```bash
# Nginx-Konfiguration kopieren
sudo cp nginx/h5p-viewer.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/h5p-viewer.conf /etc/nginx/sites-enabled/

# Domain anpassen
sudo nano /etc/nginx/sites-enabled/h5p-viewer.conf

# Nginx neu starten
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 SSL/TLS Konfiguration mit Let's Encrypt

```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx

# SSL-Zertifikat erstellen
sudo certbot --nginx -d ihre-domain.com -d www.ihre-domain.com

# Automatische Erneuerung einrichten
sudo crontab -e
# Zeile hinzufügen:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🗃️ Backup-Strategie

### Datenbank-Backup

```bash
# Backup erstellen
docker-compose exec database mysqldump -u root -p h5p > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup wiederherstellen
docker-compose exec -T database mysql -u root -p h5p < backup_20240101_120000.sql
```

### Datei-Backup

```bash
# H5P-Inhalte sichern
tar -czf h5p_content_$(date +%Y%m%d).tar.gz ./public/h5p/
tar -czf h5p_uploads_$(date +%Y%m%d).tar.gz ./public/uploads/
```

## 🧹 Wartung und Monitoring

### System-Status überprüfen

```bash
# Anwendungsstatus
curl -f http://localhost:3000/h5p-viewer/api/health

# Container-Status
docker-compose ps

# Logs einsehen
docker-compose logs -f
```

### H5P-Inhalte bereinigen

```bash
# Cleanup-Skript ausführbar machen
chmod +x scripts/cleanup-h5p-linux.sh

# Scan-Modus (nur anzeigen)
./scripts/cleanup-h5p-linux.sh --scan

# Bereinigung durchführen
./scripts/cleanup-h5p-linux.sh
```

### Performance-Monitoring

```bash
# Ressourcenverbrauch überwachen
docker stats

# Speicherplatz überprüfen
df -h
du -sh ./public/h5p/
du -sh ./public/uploads/
```

## 🔥 Firewall-Konfiguration

```bash
# UFW (Ubuntu)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

## 📊 Log-Management

### Log-Rotation einrichten

```bash
# Logrotate-Konfiguration erstellen
sudo nano /etc/logrotate.d/h5p-viewer

# Inhalt:
/var/lib/docker/containers/*/*-json.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

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

3. **Datenbank-Verbindungsfehler**
   ```bash
   docker-compose logs database
   docker-compose restart database
   ```

4. **Speicherplatz-Probleme**
   ```bash
   # Docker-Cleanup
   docker system prune -a
   
   # H5P-Cleanup
   ./scripts/cleanup-h5p-linux.sh
   ```

### Performance-Optimierung

1. **Docker-Ressourcen anpassen** (docker-compose.yml):
   ```yaml
   app:
     deploy:
       resources:
         limits:
           memory: 1G
         reservations:
           memory: 512M
   ```

2. **Nginx-Caching verbessern**:
   ```nginx
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=h5p_cache:10m max_size=1g inactive=60m;
   ```

## 📞 Support

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
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Health-Check durchführen
npm run health:check
```
