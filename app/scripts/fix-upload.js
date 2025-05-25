const fs = require('fs');
const path = require('path');

// Updated content for the upload route
const updatedContent = `// filepath: c:\\Users\\Muhammad\\Documents\\h5p-viewer\\app\\api\\admin\\upload\\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import AdmZip from "adm-zip";

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper function to create a slug from a title
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the formData
    const formData = await req.formData();
    const title = formData.get('title');
    const file = formData.get('file');

    if (!title || !file) {
      return NextResponse.json(
        { error: "Title and file are required" },
        { status: 400 }
      );
    }

    // Validate that the file is an H5P file
    if (!file.name.endsWith('.h5p')) {
      return NextResponse.json(
        { error: "Only H5P files are allowed" }, 
        { status: 400 }
      );
    }

    // Create unique slug and folder name
    const baseSlug = createSlug(title);
    const uniqueId = crypto.randomBytes(4).toString('hex');
    const slug = \`\${baseSlug}-\${uniqueId}\`;
    
    // Create a name for the file in the public directory
    const fileName = \`\${slug}.h5p\`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'h5p');
    
    // Ensure the directory exists
    ensureDirectoryExists(uploadDir);
    
    // Get file data as ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    
    // Write the file to disk (temporary location)
    const tempFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(tempFilePath, fileBuffer);
    
    try {
      // Create directory for the H5P content in public/h5p
      const h5pDir = path.join(process.cwd(), 'public', 'h5p', slug);
      ensureDirectoryExists(h5pDir);
      
      // Extract H5P file (which is a ZIP file) to the directory
      const zip = new AdmZip(tempFilePath);
      zip.extractAllTo(h5pDir, true);
      
      console.log(\`H5P file extracted to \${h5pDir}\`);
      
      // Parse h5p.json to get content type if it exists
      let contentType = "Unknown";
      const h5pJsonPath = path.join(h5pDir, 'h5p.json');
      
      if (fs.existsSync(h5pJsonPath)) {
        try {
          const h5pJson = JSON.parse(fs.readFileSync(h5pJsonPath, 'utf8'));
          contentType = h5pJson.mainLibrary || contentType;
        } catch (err) {
          console.error(\`Error parsing h5p.json for \${slug}:\`, err);
        }
      }
      
      // Save the file info in the database
      const relativeFilePath = \`/h5p/\${slug}\`; // Path to the extracted directory, not the file
      const [result] = await pool.query(
        \`INSERT INTO h5p_content (title, slug, file_path, content_type, created_by) 
         VALUES (?, ?, ?, ?, ?)\`,
        [title, slug, relativeFilePath, contentType, session.user.id]
      );
      
      return NextResponse.json({
        message: "Upload successful, H5P content extracted",
        success: true,
        contentId: result.insertId,
        extractedTo: relativeFilePath
      });
    } catch (extractError) {
      // If extraction fails, delete the temporary file and throw error
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      throw new Error(\`Failed to extract H5P file: \${extractError.message}\`);
    }

  } catch (error) {
    console.error("Error uploading H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}`;

// File path
const filePath = path.join(__dirname, '..', 'api', 'admin', 'upload', 'route.ts');

// Write the updated content to the file
try {
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Successfully updated ${filePath}`);
} catch (error) {
  console.error(`Error updating file: ${error.message}`);
}
