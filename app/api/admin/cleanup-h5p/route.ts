import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import fs from 'fs';
import path from 'path';
import { getPublicPath } from '@/app/utils/paths';
import { H5PContentService } from '@/app/services/H5PContentService';

// Function to clean up orphaned H5P files
async function cleanupOrphanedH5PFiles(): Promise<{
  deletedFolders: string[];
  errors: string[];
}> {
  const deletedFolders: string[] = [];
  const errors: string[] = [];
  
  try {
    const h5pContentService = new H5PContentService();
    
    // Get all H5P content from database
    const allContent = await h5pContentService.findAll();
    const validSlugs = new Set(allContent.map(content => content.slug).filter(Boolean));
    
    // Get all folders in public/h5p
    const h5pPublicDir = getPublicPath('h5p');
    
    if (!fs.existsSync(h5pPublicDir)) {
      return { deletedFolders, errors };
    }
    
    const allFolders = await fs.promises.readdir(h5pPublicDir);
    
    for (const folderName of allFolders) {
      const folderPath = path.join(h5pPublicDir, folderName);
      const stats = await fs.promises.stat(folderPath);
      
      if (stats.isDirectory()) {
        // Check if this folder corresponds to any valid content
        if (!validSlugs.has(folderName)) {
          try {
            await fs.promises.rm(folderPath, { recursive: true, force: true });
            deletedFolders.push(folderName);
            console.log(`Deleted orphaned H5P folder: ${folderPath}`);
          } catch (error) {
            const errorMsg = `Failed to delete folder ${folderName}: ${error}`;
            errors.push(errorMsg);
            console.error(errorMsg);
          }
        }
      }
    }
    
  } catch (error) {
    const errorMsg = `Error during H5P cleanup: ${error}`;
    errors.push(errorMsg);
    console.error(errorMsg);
  }
  
  return { deletedFolders, errors };
}

// GET endpoint to check orphaned files (for admin interface)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const h5pContentService = new H5PContentService();
    const allContent = await h5pContentService.findAll();
    const validSlugs = new Set(allContent.map(content => content.slug).filter(Boolean));
    
    const h5pPublicDir = getPublicPath('h5p');
    const orphanedFolders: string[] = [];
    
    if (fs.existsSync(h5pPublicDir)) {
      const allFolders = await fs.promises.readdir(h5pPublicDir);
      
      for (const folderName of allFolders) {
        const folderPath = path.join(h5pPublicDir, folderName);
        const stats = await fs.promises.stat(folderPath);
        
        if (stats.isDirectory() && !validSlugs.has(folderName)) {
          orphanedFolders.push(folderName);
        }
      }
    }
    
    return NextResponse.json({
      orphanedFolders,
      totalOrphaned: orphanedFolders.length,
      validSlugs: Array.from(validSlugs)
    });
    
  } catch (error: any) {
    console.error("Error checking orphaned H5P files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check orphaned files" },
      { status: 500 }
    );
  }
}

// POST endpoint to clean up orphaned files
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await cleanupOrphanedH5PFiles();
    
    return NextResponse.json({
      message: "H5P cleanup completed",
      deletedFolders: result.deletedFolders,
      deletedCount: result.deletedFolders.length,
      errors: result.errors
    });
    
  } catch (error: any) {
    console.error("Error during H5P cleanup:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cleanup H5P files" },
      { status: 500 }
    );
  }
}
