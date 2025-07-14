# H5P Viewer und Verwaltungssystem

Dieses Projekt ist ein einfaches Content-Management-System für H5P-Inhalte, das es ermöglicht, H5P-Dateien hochzuladen, anzuzeigen und zu verwalten. Es bietet ein Administratorsystem ohne Registrierungsprozess.

## Funktionen

- Einfaches Login-System mit vordefiniertem Administratorkonto
- Hochladen und Verwalten von H5P-Inhalten
- Automatische Extraktion hochgeladener H5P-Dateien in das /public/h5p/ Verzeichnis
- Anzeige von H5P-Inhalten auf der Website
- Integration mit MySQL-Datenbank (über Docker)
- Responsive Design
- Vollständige Löschfunktionalität für H5P-Inhalte (Datenbank + Dateisystem)

## Voraussetzungen

- Node.js (18.x oder neuer)
- Docker und Docker Compose
- npm oder yarn

## Installation und Start

### Windows (Entwicklung)

1. **Voraussetzungen installieren:**
   - Node.js (18.x oder neuer)
   - Docker Desktop
   - Git

2. **Repository klonen:**
   ```bash
   git clone <repository-url>
   cd h5p-viewer
   ```

3. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

4. **Datenbank starten:**
   ```bash
   npm run docker:up
   ```

5. **Anwendung entwickeln:**
   ```bash
   npm run dev
   ```

### Linux (Produktion)

Für Linux-Server-Deployment siehe: [docs/LINUX-DEPLOYMENT.md](docs/LINUX-DEPLOYMENT.md)

**Schnellstart:**
```bash
# Repository klonen
git clone <repository-url>
cd h5p-viewer

# Automatisches Deployment
chmod +x deploy-linux.sh
./deploy-linux.sh

# System testen
chmod +x test-system.sh
./test-system.sh
```

**Docker Compose (Produktion):**
```bash
# Produktionsumgebung starten
docker-compose up -d

# Status überprüfen
docker-compose ps
docker-compose logs -f

# System-Health prüfen
curl http://localhost:3000/h5p-viewer/api/health
```

```bash
npm run docker:up
```

4. Führe das Setup-Skript aus:

```bash
npm run setup
```

5. Bereite die H5P-Umgebung vor:

```bash
npm run prepare-h5p
```

6. Starte die Anwendung:

```bash
npm run dev
```

Alternativ kannst du alle Schritte auf einmal ausführen:

```bash
npm run start:all
```

Öffne anschließend [http://localhost:3000](http://localhost:3000) in deinem Browser, um die Anwendung zu sehen.

## Login-Informationen

Standardmäßig wird ein Administratorkonto erstellt:

- Benutzername: `admin`
- Passwort: `admin`

Es wird dringend empfohlen, das Passwort nach dem ersten Login zu ändern.

## Projektstruktur

- `/app/api` - API-Endpunkte für H5P-Verwaltung und Authentifizierung
- `/app/admin` - Administrator-Dashboard und Upload-Seite
- `/app/h5p` - H5P-Anzeigeseiten 
- `/public/h5p` - Extrahierte H5P-Inhalte
- `/public/uploads/h5p` - Temporärer Speicher für hochgeladene H5P-Dateien

## Datenbankstruktur

Das System verwendet eine MySQL-Datenbank mit folgenden Tabellen:

- `users` - Benutzer mit Administratorrechten
- `h5p_content` - Hochgeladene H5P-Inhalte mit Metadaten

## Docker-Konfiguration

Die Datei `docker-compose.yml` enthält:

- MySQL-Datenbank (Port 3306)
- PHPMyAdmin zur Datenbankadministration (Port 8080)

Du kannst auf PHPMyAdmin unter http://localhost:8080 zugreifen.

## Maintenance-Tools

Das Projekt enthält einige nützliche Wartungsskripte:

1. `app/scripts/clean-h5p.js` - Bereinigt verwaiste H5P-Dateien und -Verzeichnisse, die keinen entsprechenden Datenbankeintrag haben:
   ```bash
   # Nur anzeigen, was gelöscht werden würde
   node app/scripts/clean-h5p.js --dry-run
   
   # Tatsächlich bereinigen
   node app/scripts/clean-h5p.js
   ```

2. `app/scripts/fix-delete.js` - Spezielles Skript zur gezielten Bereinigung von H5P-Dateien nach Löschproblemen:
   ```bash
   # Nur scannen ohne Dateien zu löschen
   node app/scripts/fix-delete.js --scan
   
   # Bereinigen aller verwaisten Dateien
   node app/scripts/fix-delete.js --clean
   
   # Gezielt Dateien für einen bestimmten Inhalt bereinigen
   node app/scripts/fix-delete.js --id=123
   ```

## Hinweise zur Sicherheit

Diese Anwendung ist jetzt produktionsbereit mit folgenden Sicherheitsmerkmalen:

1. Automatische Extraktion von H5P-Dateien in den öffentlichen Ordner
2. Entfernung aller Testkomponenten und Entwicklungsendpunkte
3. Vollständige Löschfunktion für H5P-Inhalte (Datenbank + Dateisystem)

Für einen sicheren Produktiveinsatz empfehlen wir zusätzlich:

1. Sichere Passwörter verwenden (nicht im Klartext speichern)
2. HTTPS für die sichere Datenübertragung einrichten
3. Regelmäßige Backups der Datenbank durchführen
4. Dateiberechtigungen für die hochgeladenen und extrahierten Inhalte überprüfen
5. Zugriffskontrollen für die Admin-Bereiche implementieren
6. Regelmäßige Ausführung des Bereinigungsskripts zur Entfernung verwaister Dateien
