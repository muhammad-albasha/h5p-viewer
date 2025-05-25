import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";

// Helper function to ensure a directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Path to a sample H5P file in the uploads directory (if any exists)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'h5p');
    
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json({ 
        message: "No uploads directory found. Create it first.",
        path: uploadsDir
      });
    }
    
    // Get all files in the uploads directory
    const files = fs.readdirSync(uploadsDir);
    const h5pFiles = files.filter(file => file.endsWith('.h5p'));
    
    if (h5pFiles.length === 0) {
      return NextResponse.json({ 
        message: "No H5P files found in the uploads directory",
        files
      });
    }
    
    // Try to extract the first H5P file
    const testFile = h5pFiles[0];
    const testFilePath = path.join(uploadsDir, testFile);
    const extractDir = path.join(process.cwd(), 'public', 'h5p', '_test-extract');
    
    // Ensure extract directory exists and is empty
    if (fs.existsSync(extractDir)) {
      // Delete all contents of the directory
      fs.rmSync(extractDir, { recursive: true, force: true });
    }
    
    ensureDirectoryExists(extractDir);
    
    // Extract the file
    try {
      const zip = new AdmZip(testFilePath);
      zip.extractAllTo(extractDir, true);
      
      // List files in the extracted directory
      const extractedFiles = fs.readdirSync(extractDir);
      
      return NextResponse.json({
        success: true,
        message: "H5P file extraction test successful",
        source: testFilePath,
        destination: extractDir,
        extractedFiles
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: "Failed to extract H5P file",
        error: error.message,
        source: testFilePath
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error testing H5P extraction:", error);
    return NextResponse.json(
      { error: error.message || "Test failed" },
      { status: 500 }
    );
  }
}
