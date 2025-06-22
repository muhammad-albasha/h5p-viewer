# H5P Passwort-Schutz Migration

Diese Migration fügt eine Passwort-Spalte zur H5P Content Tabelle hinzu.

## SQL Migration (für PostgreSQL)

```sql
ALTER TABLE h5p_content 
ADD COLUMN password VARCHAR(255) NULL;
```

## SQL Migration (für MySQL)

```sql
ALTER TABLE h5p_content 
ADD COLUMN password VARCHAR(255) NULL;
```

## SQL Migration (für SQLite)

```sql
ALTER TABLE h5p_content 
ADD COLUMN password TEXT NULL;
```

## Verwendung

Nach der Migration können Sie:

1. **Beim Upload**: Ein Passwort im Admin-Upload-Formular setzen
2. **Beim Bearbeiten**: Das Passwort in der Admin-Bearbeitungsseite ändern oder entfernen
3. **Beim Anzeigen**: Benutzer müssen das Passwort eingeben, um geschützte Inhalte zu sehen

## Features

- ✅ Passwort-Feld im Upload-Formular
- ✅ Passwort-Feld im Bearbeitungsformular
- ✅ Passwort-Schutz-Bildschirm für Benutzer
- ✅ API-Endpunkt zur Passwort-Überprüfung
- ✅ API-Endpunkt zur Schutz-Status-Überprüfung
- ✅ Sichere Passwort-Handhabung (Passwort wird nicht in der öffentlichen API preisgegeben)

## Sicherheitshinweise

- Passwörter werden derzeit im Klartext gespeichert
- Für Produktionsumgebungen wird empfohlen, Passwörter zu hashen
- Die Passwort-Überprüfung erfolgt über sichere API-Endpunkte
