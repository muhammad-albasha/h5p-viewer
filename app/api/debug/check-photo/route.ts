import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { existsSync, readdir } from "fs";
import { readFile } from "fs/promises";

/**
 * API route for checking if contact photos exist on the server
 */
export async function GET(request: NextRequest) {
  try {
    // Get the photo filename from the query parameter
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    
    const results: any = {
      serverInfo: {
        cwd: process.cwd(),
        environment: process.env.NODE_ENV,
        platform: process.platform,
        basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/h5p-viewer',
      },
      directories: {},
      fileExists: false,
      queriedFile: filename,
    };
    
    // Check if uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const contactsDir = path.join(uploadsDir, "contacts");
    
    results.directories.uploads = {
      path: uploadsDir,
      exists: existsSync(uploadsDir)
    };
    
    results.directories.contacts = {
      path: contactsDir,
      exists: existsSync(contactsDir)
    };
    
    // List files in the contacts directory if it exists
    if (results.directories.contacts.exists) {
      try {
        const files = await new Promise<string[]>((resolve, reject) => {
          readdir(contactsDir, (err, files) => {
            if (err) reject(err);
            else resolve(files);
          });
        });
        
        results.directories.contacts.files = files
          .filter(f => !f.startsWith('.')) // Skip hidden files
          .slice(0, 20); // Limit to first 20 files
        
        results.directories.contacts.fileCount = files.length;
      } catch (e) {
        results.directories.contacts.error = `Could not read directory: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
    
    // If a specific filename is provided, check if it exists
    if (filename) {
      const filePath = path.join(contactsDir, filename);
      results.fileExists = existsSync(filePath);
      results.filePath = filePath;
      
      if (results.fileExists) {
        try {
          const stats = await new Promise((resolve, reject) => {
            import('fs').then(({ stat }) => {
              stat(filePath, (err, stats) => {
                if (err) reject(err);
                else resolve(stats);
              });
            });
          });
          
          results.fileInfo = {
            size: (stats as any).size,
            created: (stats as any).birthtime,
            modified: (stats as any).mtime,
            isFile: (stats as any).isFile(),
          };
          
          // Read the first few bytes to check if it's a valid image
          try {
            const buffer = await readFile(filePath, { encoding: null });
            const header = buffer.slice(0, 8).toString('hex');
            
            results.fileInfo.header = header;
            results.fileInfo.fileType = getFileTypeFromHeader(header);
          } catch (readErr) {
            results.fileInfo.readError = `Could not read file: ${readErr instanceof Error ? readErr.message : String(readErr)}`;
          }
        } catch (statErr) {
          results.fileError = `Could not get file stats: ${statErr instanceof Error ? statErr.message : String(statErr)}`;
        }
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error checking contact photos:", error);
    return NextResponse.json(
      { 
        error: "Failed to check contact photos",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Simple file type detection from hex headers
 */
function getFileTypeFromHeader(hex: string): string {
  // JPEG: FF D8 FF
  if (hex.startsWith('ffd8ff')) return 'image/jpeg';
  
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (hex.startsWith('89504e47')) return 'image/png';
  
  // GIF: 47 49 46 38
  if (hex.startsWith('47494638')) return 'image/gif';
  
  // WebP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
  if (hex.startsWith('52494646') && hex.slice(16, 24).includes('57454250')) return 'image/webp';
  
  return 'unknown';
}
