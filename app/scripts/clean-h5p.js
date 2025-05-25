/**
 * Dieses Skript findet und bereinigt verwaiste H5P-Dateien, die keine Entsprechung in der Datenbank haben
 * Führen Sie es aus mit: node app/scripts/clean-h5p.js
 * Fügen Sie --dry-run hinzu, um nur zu sehen, was gelöscht werden würde ohne tatsächlich zu löschen
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Konfiguration aus .env laden (falls vorhanden)
require('dotenv').config();

// Datenbankverbindung
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'h5p',
};

// Flags überprüfen
const dryRun = process.argv.includes('--dry-run');
if (dryRun) {
  console.log('🔍 DRY RUN MODUS - Es werden keine Dateien gelöscht');
}

async function run() {
  let connection;
  try {
    console.log('🔄 Verbindung zur Datenbank wird hergestellt...');
    connection = await mysql.createConnection(dbConfig);
    
    // Pfade
    const h5pDir = path.join(process.cwd(), 'public', 'h5p');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'h5p');
    
    // Prüfen, ob Verzeichnisse existieren
    if (!fs.existsSync(h5pDir)) {
      console.error(`❌ H5P-Verzeichnis nicht gefunden: ${h5pDir}`);
      return;
    }
    
    // Alle Slugs aus der Datenbank abrufen
    console.log('🔄 Abrufen aller H5P-Inhalte aus der Datenbank...');
    const [rows] = await connection.query('SELECT slug, file_path FROM h5p_content');
    const dbSlugs = new Set(rows.map(row => row.slug));
    const dbFilePaths = new Set(rows.map(row => row.file_path));
    console.log(`ℹ️ ${dbSlugs.size} Inhalte in der Datenbank gefunden`);
    
    // H5P-Verzeichnisse überprüfen
    if (fs.existsSync(h5pDir)) {
      console.log('🔄 Überprüfe H5P-Inhaltsverzeichnisse...');
      const h5pDirs = fs.readdirSync(h5pDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
      
      let orphanedDirs = 0;
      
      for (const dir of h5pDirs) {
        // Extrahiere den Slug-Teil (vor dem ersten Bindestrich)
        const slugParts = dir.split('-');
        const potentialSlug = slugParts[0];
        
        // Prüfe, ob dieser Slug in der Datenbank existiert
        if (!dbSlugs.has(dir) && !dbSlugs.has(potentialSlug)) {
          console.log(`🗑️ Verwaistes H5P-Verzeichnis gefunden: ${dir}`);
          orphanedDirs++;
          
          if (!dryRun) {
            const fullPath = path.join(h5pDir, dir);
            console.log(`   🗑️ Lösche: ${fullPath}`);
            fs.rmSync(fullPath, { recursive: true, force: true });
          }
        }
      }
      
      console.log(`ℹ️ ${orphanedDirs} verwaiste H5P-Verzeichnisse gefunden`);
    }
    
    // Überprüfe Upload-Dateien
    if (fs.existsSync(uploadsDir)) {
      console.log('🔄 Überprüfe hochgeladene H5P-Dateien...');
      const uploadFiles = getAllFiles(uploadsDir);
      
      let orphanedFiles = 0;
      
      for (const file of uploadFiles) {
        // Relativpfad aus dem vollständigen Pfad erstellen
        const relativePath = file.replace(process.cwd() + path.sep + 'public', '');
        const normalizedPath = relativePath.replace(/\\/g, '/').replace(/^\//, '');
        
        // Prüfe, ob dieser Pfad in der Datenbank existiert
        if (!dbFilePaths.has(normalizedPath)) {
          console.log(`🗑️ Verwaiste Upload-Datei gefunden: ${normalizedPath}`);
          orphanedFiles++;
          
          if (!dryRun) {
            console.log(`   🗑️ Lösche: ${file}`);
            fs.unlinkSync(file);
          }
        }
      }
      
      console.log(`ℹ️ ${orphanedFiles} verwaiste Upload-Dateien gefunden`);
      
      // Leere Verzeichnisse entfernen
      if (!dryRun) {
        removeEmptyDirs(uploadsDir);
      }
    }
    
    console.log('✅ Bereinigung abgeschlossen' + (dryRun ? ' (Dry Run)' : ''));
    
  } catch (error) {
    console.error('❌ Fehler:', error);
  } finally {
    if (connection) {
      console.log('🔄 Schließe Datenbankverbindung...');
      await connection.end();
    }
  }
}

// Hilfsfunktion, um alle Dateien rekursiv zu finden
function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  
  return results;
}

// Hilfsfunktion zum Entfernen leerer Verzeichnisse
function removeEmptyDirs(dir) {
  let files;
  
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    return;
  }
  
  if (files.length > 0) {
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        removeEmptyDirs(fullPath);
      }
    });
    
    // Überprüfe erneut, nachdem mögliche Unterverzeichnisse entfernt wurden
    files = fs.readdirSync(dir);
  }
  
  if (files.length === 0) {
    console.log(`   🗑️ Entferne leeres Verzeichnis: ${dir}`);
    fs.rmdirSync(dir);
    return;
  }
}

run().catch(console.error);
