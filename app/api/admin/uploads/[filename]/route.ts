import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import fs from "fs";
import path from "path";

// DELETE endpoint to remove a specific uploaded file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const filename = decodeURIComponent(resolvedParams.filename);

    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json(
        { error: "Invalid filename" },
        { status: 400 }
      );
    }

    let filePath: string | null = null;
    let deleted = false;

    // Check in h5p uploads directory first
    const h5pUploadsDir = path.join(process.cwd(), "public", "uploads", "h5p");
    const h5pFilePath = path.join(h5pUploadsDir, filename);
    
    if (fs.existsSync(h5pFilePath)) {
      const stats = await fs.promises.stat(h5pFilePath);
      if (stats.isFile()) {
        await fs.promises.unlink(h5pFilePath);
        filePath = h5pFilePath;
        deleted = true;
      }
    }

    // If not found in h5p directory, check other upload subdirectories
    if (!deleted) {
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
                await fs.promises.unlink(candidateFilePath);
                filePath = candidateFilePath;
                deleted = true;
                break;
              }
            }
          }
        }
      }
    }

    if (!deleted) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    console.log(`Successfully deleted file: ${filePath}`);

    return NextResponse.json({
      message: "File deleted successfully",
      filename: filename,
      path: filePath
    });

  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
