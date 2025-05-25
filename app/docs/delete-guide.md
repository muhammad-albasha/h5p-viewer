# H5P Inhalte löschen - Benutzerhandbuch

## Übersicht

Das H5P-Viewer System ermöglicht das vollständige Löschen von H5P-Inhalten, einschließlich:
- Datenbankinformationen
- Hochgeladene H5P-Dateien
- Extrahierte Inhaltsordner
- Temporäre Dateien

## Löschen über die Admin-Oberfläche

1. **Über die Hauptseite löschen**:
   - Navigieren Sie zur Admin-Hauptseite
   - Suchen Sie den gewünschten H5P-Inhalt in der Tabelle
   - Klicken Sie auf die "Löschen"-Schaltfläche
   - Bestätigen Sie die Löschung im Dialog

2. **Über die Bearbeitungsseite löschen**:
   - Öffnen Sie den H5P-Inhalt zur Bearbeitung
   - Klicken Sie unten links auf die "Löschen"-Schaltfläche
   - Bestätigen Sie die Löschung im Dialog

## Fehlerbehebung bei Löschproblemen

Falls nach dem Löschen noch Dateien im System verbleiben:

1. **Verwendung des H5P-Bereinigungstools**:
   - Starten Sie `h5p-cleanup.bat` (Windows) oder
   - Führen Sie eines der folgenden Kommandos aus:

   ```bash
   # Scan-Modus zum Finden verwaister Dateien
   node app/scripts/fix-delete.js --scan

   # Bereinigungsmodus zum Entfernen verwaister Dateien
   node app/scripts/fix-delete.js --clean

   # Gezielte Bereinigung für einen bestimmten Inhalt
   node app/scripts/fix-delete.js --id=123   # Ersetzen Sie 123 mit der Inhalts-ID
   ```

2. **Häufige Probleme und Lösungen**:

   - **Symptom**: Inhalt wurde gelöscht, erscheint aber noch in der Vorschau
     **Lösung**: Browser-Cache leeren und Seite neu laden

   - **Symptom**: Fehlermeldung "Zugriff verweigert" beim Löschen
     **Lösung**: Server neu starten oder Administrator-Rechte prüfen

   - **Symptom**: Dateien bleiben im Dateisystem zurück
     **Lösung**: H5P-Bereinigungstool mit `--clean` Option verwenden

3. **Vorbeugung von Löschproblemen**:
   - Regelmäßige Ausführung des Bereinigungstools
   - Vermeiden von parallelen Löschvorgängen im Admin-Bereich
   - Server mit ausreichenden Schreibrechten konfigurieren

## Support

Bei anhaltenden Problemen mit dem Löschen von H5P-Inhalten wenden Sie sich bitte an den Systemadministrator.
