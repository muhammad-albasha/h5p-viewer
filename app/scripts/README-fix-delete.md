# H5P-Dateien Bereinigungsskript

Dieses Skript dient zur Behebung von Problemen mit H5P-Dateien, die beim Löschen von Inhalten im H5P-Viewer nicht korrekt entfernt wurden.

## Problem

Bei der Löschung von H5P-Inhalten über die Admin-Oberfläche können gelegentlich folgende Probleme auftreten:

1. Die Datenbankeinträge werden erfolgreich gelöscht, aber die zugehörigen Dateien bleiben im Dateisystem zurück
2. H5P-Ordner und Upload-Dateien werden nicht vollständig entfernt
3. Es entstehen verwaiste Dateien und Ordner, die Speicherplatz belegen

## Lösungsansatz

Dieses Skript bietet verschiedene Optionen zur Bereinigung:

- **Scan-Modus**: Findet verwaiste Dateien/Ordner, ohne sie zu löschen
- **Clean-Modus**: Bereinigt automatisch alle erkannten verwaisten Dateien
- **ID-spezifischer Modus**: Bereinigt gezielt Dateien für einen bestimmten H5P-Inhalt

## Verwendung

```bash
# Nur scannen und anzeigen (ohne Löschung)
node app/scripts/fix-delete.js --scan

# Automatische Bereinigung aller verwaisten Dateien
node app/scripts/fix-delete.js --clean

# Bereinigung für einen bestimmten H5P-Inhalt (ID 123)
node app/scripts/fix-delete.js --id=123
```

## Was das Skript tut

1. Verbindet mit der MySQL-Datenbank, um vorhandene H5P-Inhalte zu identifizieren
2. Überprüft die H5P-Verzeichnisse und Upload-Ordner auf verwaiste Dateien
3. Findet und entfernt Dateien und Ordner, die nicht mehr zu einem Datenbankeintrag gehören
4. Gibt ausführliche Protokolle über die durchgeführten Aktionen aus

## Nach der Ausführung

- Überprüfen Sie den Server auf freigegebenen Speicherplatz
- Stellen Sie sicher, dass keine wichtigen Dateien versehentlich entfernt wurden
- Bestätigen Sie, dass die Löschfunktion im Admin-Bereich jetzt korrekt funktioniert

## Wartungsplan

Es wird empfohlen, dieses Skript regelmäßig (z.B. monatlich) auszuführen, um nicht benötigten Speicherplatz freizugeben und die Systemleistung zu optimieren.

Bei Fragen oder Problemen wenden Sie sich bitte an den Systemadministrator.
