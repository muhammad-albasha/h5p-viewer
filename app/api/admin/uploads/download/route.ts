import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import fs from "fs";
import path from "path";

// GET endpoint to download a specific uploaded file
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const filename = url.searchParams.get('file');

    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    let filePath: string | null = null;
    let fileBuffer: Buffer | null = null;

    // Check in h5p uploads directory first
    const h5pUploadsDir = path.join(process.cwd(), "public", "uploads", "h5p");
    const h5pFilePath = path.join(h5pUploadsDir, filename);
    
    if (fs.existsSync(h5pFilePath)) {
      const stats = await fs.promises.stat(h5pFilePath);
      if (stats.isFile()) {
        fileBuffer = await fs.promises.readFile(h5pFilePath);
        filePath = h5pFilePath;
      }
    }

    // If not found in h5p directory, check other upload subdirectories
    if (!fileBuffer) {
      const baseUploadsDir = path.join(process.cwd(), "public", "uploads");
      if (fs.existsSync(baseUploadsDir)) {
        const subDirs = await fs.promises.readdir(baseUploadsDir, { withFileTypes: true });
        
        for (const subDir of subDirs) {
          if (subDir.isDirectory()) {
            const subDirPath = path.join(baseUploadsDir, subDir.name);
            const candidateFilePath = path.join(subDirPath, filename);
            
            if (fs.existsSync(candidateFilePath)) {
              const stats = await fs.promises.stat(candidateFilePath);
              if (stats.isFile()) {
                fileBuffer = await fs.promises.readFile(candidateFilePath);
                filePath = candidateFilePath;
                break;
              }
            }
          }
        }
      }
    }

    if (!fileBuffer || !filePath) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    // Determine content type based on file extension
    const extension = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case '.h5p':
        contentType = 'application/zip';
        break;
      case '.zip':
        contentType = 'application/zip';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.json':
        contentType = 'application/json';
        break;
    }

    console.log(`Downloading file: ${filePath}`);

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to download file" },
      { status: 500 }
    );
  }
}
