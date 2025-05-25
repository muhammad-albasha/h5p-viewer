/**
 * Dieses Skript hilft beim Auffinden und Bereinigen von H5P-Dateien,
 * die möglicherweise nicht korrekt gelöscht wurden.
 * 
 * Nutzung:
 * - node app/scripts/fix-delete.js --scan     Scannt nach verwaisten H5P-Dateien
 * - node app/scripts/fix-delete.js --clean    Bereinigt erkannte verwaiste Dateien
 * - node app/scripts/fix-delete.js --id=123   Bereinigt Dateien für einen bestimmten Inhalt
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// DB-Konfiguration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'h5p',
};

// Verzeichnisse
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const H5P_DIR = path.join(PUBLIC_DIR, 'h5p');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads', 'h5p');

// Command-Line-Parameter
const args = process.argv.slice(2);
const SCAN_ONLY = args.includes('--scan');
const CLEAN_MODE = args.includes('--clean');
const ID_PARAM = args.find(arg => arg.startsWith('--id='));
const specificId = ID_PARAM ? ID_PARAM.split('=')[1] : null;

// Hilfsfunktionen
function getAllFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(itemPath));
    } else {
      results.push(itemPath);
    }
  }
  
  return results;
}

function removeEmptyDirectories(dir) {
  if (!fs.existsSync(dir)) return;
  
  let files = fs.readdirSync(dir);
  
  if (files.length > 0) {
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        removeEmptyDirectories(fullPath);
      }
    });
    
    // Überprüfe noch einmal nach dem Entfernen leerer Unterverzeichnisse
    files = fs.readdirSync(dir);
  }
  
  if (files.length === 0) {
    // Nicht das Hauptverzeichnis löschen
    if (dir !== H5P_DIR && dir !== UPLOADS_DIR) {
      console.log(`Entferne leeres Verzeichnis: ${dir}`);
      if (!SCAN_ONLY) {
        try {
          fs.rmdirSync(dir);
        } catch (err) {
          console.error(`Fehler beim Entfernen des Verzeichnisses ${dir}:`, err);
        }
      }
    }
  }
}

// Hauptfunktion
async function main() {
  console.log('🔍 Starte H5P-Dateien-Bereinigung...');
  
  let connection;
  try {
    // Verbindung zur Datenbank herstellen
    console.log('Verbinde zur Datenbank...');
    connection = await mysql.createConnection(dbConfig);
    
    if (specificId) {
      // Spezifischen Inhalt bereinigen
      await cleanupSpecificContent(connection, specificId);
    } else {
      // Alle Inhalte überprüfen und ggf. bereinigen
      await scanAndCleanupContent(connection);
    }
    
    // Leere Verzeichnisse entfernen
    if (!SCAN_ONLY) {
      console.log('\n🧹 Entferne leere Verzeichnisse...');
      removeEmptyDirectories(H5P_DIR);
      removeEmptyDirectories(UPLOADS_DIR);
    }
    
    console.log(`\n✅ Bereinigung abgeschlossen${SCAN_ONLY ? ' (nur Scan)' : ''}`);
  } catch (error) {
    console.error('❌ Fehler:', error);
  } finally {
    if (connection) await connection.end();
  }
}

async function scanAndCleanupContent(connection) {
  // 1. Alle H5P-Inhalte aus der Datenbank laden
  const [rows] = await connection.query('SELECT id, title, file_path, slug FROM h5p_content');
  console.log(`📊 ${rows.length} H5P-Inhalte in der Datenbank gefunden`);
  
  // Erstelle einen Set mit allen bekannten Slugs
  const dbSlugs = new Set(rows.map(row => row.slug).filter(Boolean));
  
  // 2. Alle H5P-Verzeichnisse scannen
  console.log('\n🔍 Scanne Verzeichnisstruktur...');
  
  if (fs.existsSync(H5P_DIR)) {
    const h5pFolders = fs.readdirSync(H5P_DIR)
      .filter(item => {
        const stat = fs.statSync(path.join(H5P_DIR, item));
        return stat.isDirectory();
      });
    
    console.log(`📁 ${h5pFolders.length} H5P-Ordner gefunden`);
    
    // Vergleiche mit Datenbank-Slugs
    let orphanCount = 0;
    for (const folder of h5pFolders) {
      if (!dbSlugs.has(folder)) {
        orphanCount++;
        console.log(`🗑️ Verwaister H5P-Ordner gefunden: ${folder}`);
        
        if (CLEAN_MODE && !SCAN_ONLY) {
          try {
            const folderPath = path.join(H5P_DIR, folder);
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`  ✓ Gelöscht: ${folderPath}`);
          } catch (err) {
            console.error(`  ❌ Fehler beim Löschen von ${folder}:`, err);
          }
        }
      }
    }
    
    if (orphanCount === 0) {
      console.log('✓ Keine verwaisten H5P-Ordner gefunden');
    }
  } else {
    console.log(`❌ H5P-Verzeichnis nicht gefunden: ${H5P_DIR}`);
  }
  
  // 3. Upload-Verzeichnis überprüfen
  if (fs.existsSync(UPLOADS_DIR)) {
    const uploadFiles = fs.readdirSync(UPLOADS_DIR)
      .filter(item => !item.startsWith('.'));
    
    console.log(`\n📁 ${uploadFiles.length} Dateien/Ordner im Uploads-Verzeichnis gefunden`);
    
    // Überprüfe jeden Upload auf Zugehörigkeit zu einem Datenbankeintrag
    let orphanUploadCount = 0;
    for (const item of uploadFiles) {
      const itemPath = path.join(UPLOADS_DIR, item);
      const stat = fs.statSync(itemPath);
      
      // Versuche, den zugehörigen Slug zu extrahieren
      let belongsToExistingContent = false;
      
      for (const row of rows) {
        const slug = row.slug;
        if (slug && (item.includes(slug) || item.startsWith(slug))) {
          belongsToExistingContent = true;
          break;
        }
      }
      
      if (!belongsToExistingContent) {
        orphanUploadCount++;
        console.log(`🗑️ Verwaiste Upload-${stat.isDirectory() ? 'Ordner' : 'Datei'} gefunden: ${item}`);
        
        if (CLEAN_MODE && !SCAN_ONLY) {
          try {
            if (stat.isDirectory()) {
              fs.rmSync(itemPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(itemPath);
            }
            console.log(`  ✓ Gelöscht: ${itemPath}`);
          } catch (err) {
            console.error(`  ❌ Fehler beim Löschen von ${item}:`, err);
          }
        }
      }
    }
    
    if (orphanUploadCount === 0) {
      console.log('✓ Keine verwaisten Upload-Dateien gefunden');
    }
  } else {
    console.log(`❓ Uploads-Verzeichnis nicht gefunden: ${UPLOADS_DIR}`);
  }
}

async function cleanupSpecificContent(connection, id) {
  console.log(`\n🎯 Bereinige Dateien für Inhalt mit ID: ${id}`);
  
  // Inhalt aus Datenbank abrufen
  const [rows] = await connection.query('SELECT id, title, file_path, slug FROM h5p_content WHERE id = ?', [id]);
  
  if (rows.length === 0) {
    console.log(`❌ Inhalt mit ID ${id} nicht in der Datenbank gefunden`);
    console.log('   Möglicherweise wurde er bereits gelöscht - suche nach verwaisten Dateien...');
    
    // Suche nach Dateien, die die ID im Namen enthalten könnten
    await cleanupByPattern(id);
    return;
  }
  
  const content = rows[0];
  console.log(`📄 Gefunden: "${content.title}" (Slug: ${content.slug || 'nicht definiert'})`);
  
  // 1. H5P-Verzeichnis überprüfen
  if (content.slug) {
    const h5pFolder = path.join(H5P_DIR, content.slug);
    
    if (fs.existsSync(h5pFolder)) {
      console.log(`🗑️ H5P-Ordner gefunden: ${h5pFolder}`);
      
      if (!SCAN_ONLY) {
        try {
          fs.rmSync(h5pFolder, { recursive: true, force: true });
          console.log('  ✓ Ordner gelöscht');
        } catch (err) {
          console.error(`  ❌ Fehler beim Löschen des H5P-Ordners:`, err);
        }
      }
    } else {
      console.log(`❓ H5P-Ordner nicht gefunden für Slug "${content.slug}"`);
      
      // Suche nach ähnlichen Ordnern
      if (fs.existsSync(H5P_DIR)) {
        const folders = fs.readdirSync(H5P_DIR);
        const similarFolders = folders.filter(folder => 
          folder.toLowerCase().includes(content.slug.toLowerCase()) ||
          folder.includes(id)
        );
        
        for (const folder of similarFolders) {
          const folderPath = path.join(H5P_DIR, folder);
          console.log(`🗑️ Ähnlicher H5P-Ordner gefunden: ${folderPath}`);
          
          if (!SCAN_ONLY) {
            try {
              fs.rmSync(folderPath, { recursive: true, force: true });
              console.log('  ✓ Ordner gelöscht');
            } catch (err) {
              console.error(`  ❌ Fehler beim Löschen des Ordners:`, err);
            }
          }
        }
      }
    }
  }
  
  // 2. Uploaded File überprüfen
  if (content.file_path) {
    const uploadedFilePath = path.join(PUBLIC_DIR, content.file_path.startsWith('/') ? 
      content.file_path.substring(1) : content.file_path);
    
    if (fs.existsSync(uploadedFilePath)) {
      console.log(`🗑️ Hochgeladene Datei gefunden: ${uploadedFilePath}`);
      
      if (!SCAN_ONLY) {
        try {
          fs.unlinkSync(uploadedFilePath);
          console.log('  ✓ Datei gelöscht');
        } catch (err) {
          console.error(`  ❌ Fehler beim Löschen der Datei:`, err);
        }
      }
    } else {
      console.log(`❓ Hochgeladene Datei nicht gefunden: ${uploadedFilePath}`);
    }
  }
  
  // 3. Uploads-Verzeichnis nach ähnlichen Dateien durchsuchen
  await cleanupByPattern(content.slug || id);
}

async function cleanupByPattern(pattern) {
  if (!pattern) return;
  
  console.log(`\n🔍 Suche nach Dateien/Ordnern mit Pattern: "${pattern}"`);
  
  if (fs.existsSync(UPLOADS_DIR)) {
    const items = fs.readdirSync(UPLOADS_DIR);
    let matchCount = 0;
    
    for (const item of items) {
      if (item.includes(pattern)) {
        const itemPath = path.join(UPLOADS_DIR, item);
        const isDir = fs.statSync(itemPath).isDirectory();
        
        matchCount++;
        console.log(`🗑️ Übereinstimmung gefunden (${isDir ? 'Ordner' : 'Datei'}): ${itemPath}`);
        
        if (!SCAN_ONLY) {
          try {
            if (isDir) {
              fs.rmSync(itemPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(itemPath);
            }
            console.log('  ✓ Gelöscht');
          } catch (err) {
            console.error(`  ❌ Fehler beim Löschen:`, err);
          }
        }
      }
    }
    
    if (matchCount === 0) {
      console.log('✓ Keine übereinstimmenden Dateien gefunden');
    }
  }
}

// Programm starten
main().catch(error => {
  console.error('Unbehandelter Fehler:', error);
  process.exit(1);
});
