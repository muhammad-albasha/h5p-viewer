import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import fs from "fs";
import path from "path";
import { getUploadsPath } from "@/app/utils/paths";

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  created: string;
  type: 'h5p' | 'other';
}

// GET endpoint to list all uploaded files
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const files: UploadedFile[] = [];
    
    // Check h5p uploads directory
    const h5pUploadsDir = getUploadsPath("h5p");
    if (fs.existsSync(h5pUploadsDir)) {
      const h5pFiles = await fs.promises.readdir(h5pUploadsDir);
      
      for (const fileName of h5pFiles) {
        const filePath = path.join(h5pUploadsDir, fileName);
        try {
          const stats = await fs.promises.stat(filePath);
          if (stats.isFile()) {
            files.push({
              name: fileName,
              path: `uploads/h5p/${fileName}`,
              size: stats.size,
              created: stats.birthtime.toISOString(),
              type: fileName.toLowerCase().endsWith('.h5p') ? 'h5p' : 'other'
            });
          }
        } catch (err) {
          console.warn(`Could not get stats for file ${fileName}:`, err);
        }
      }
    }

    // Check other upload directories (contacts, etc.)
    const baseUploadsDir = path.join(process.cwd(), "public", "uploads");
    if (fs.existsSync(baseUploadsDir)) {
      const subDirs = await fs.promises.readdir(baseUploadsDir, { withFileTypes: true });
      
      for (const subDir of subDirs) {
        if (subDir.isDirectory() && subDir.name !== 'h5p') {
          const subDirPath = path.join(baseUploadsDir, subDir.name);
          try {
            const subFiles = await fs.promises.readdir(subDirPath);
            
            for (const fileName of subFiles) {
              const filePath = path.join(subDirPath, fileName);
              try {
                const stats = await fs.promises.stat(filePath);
                if (stats.isFile()) {
                  files.push({
                    name: fileName,
                    path: `uploads/${subDir.name}/${fileName}`,
                    size: stats.size,
                    created: stats.birthtime.toISOString(),
                    type: fileName.toLowerCase().endsWith('.h5p') ? 'h5p' : 'other'
                  });
                }
              } catch (err) {
                console.warn(`Could not get stats for file ${fileName}:`, err);
              }
            }
          } catch (err) {
            console.warn(`Could not read directory ${subDir.name}:`, err);
          }
        }
      }
    }

    // Sort files by creation date (newest first)
    files.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return NextResponse.json({
      files,
      totalFiles: files.length,
      h5pFiles: files.filter(f => f.type === 'h5p').length,
      otherFiles: files.filter(f => f.type === 'other').length
    });

  } catch (error: any) {
    console.error("Error listing uploaded files:", error);
    return NextResponse.json(
      { error: error.message || "Failed to list uploaded files" },
      { status: 500 }
    );
  }
}
