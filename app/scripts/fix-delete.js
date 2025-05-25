const fs = require('fs');
const path = require('path');

// Updated content for the delete route
const updatedContent = `// filepath: c:\\Users\\Muhammad\\Documents\\h5p-viewer\\app\\api\\admin\\content\\[id]\\route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import fs from "fs";
import path from "path";

// Helper function to delete a directory and all its contents recursively
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recursive call for directories
        deleteFolderRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
      }
    });
    
    // Delete the empty folder
    fs.rmdirSync(folderPath);
  }
}

// DELETE endpoint to remove H5P content
export async function DELETE(
  request,
  { params }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Get content info before deletion
    const [content] = await pool.query(
      "SELECT file_path, slug FROM h5p_content WHERE id = ?",
      [id]
    );

    if (Array.isArray(content) && content.length === 0) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    const contentData = content[0];
    const filePath = contentData.file_path;
    const slug = contentData.slug;

    // Handle both file and directory paths
    if (filePath.includes('/uploads/h5p/')) {
      // It's an uploaded file in the uploads directory
      const fullPath = path.join(process.cwd(), "public", filePath);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } 
    else if (filePath.includes('/h5p/')) {
      // It's an extracted directory in the h5p directory
      const h5pDir = path.join(process.cwd(), "public", filePath);
      
      if (fs.existsSync(h5pDir)) {
        // Delete directory and all its contents
        deleteFolderRecursive(h5pDir);
        console.log(\`Deleted H5P directory: \${h5pDir}\`);
      } else {
        console.log(\`Directory not found: \${h5pDir}\`);
      }
    }

    // Delete from database
    await pool.query("DELETE FROM h5p_content WHERE id = ?", [id]);

    return NextResponse.json({ 
      message: "Content deleted successfully",
      contentId: id
    });
  } catch (error) {
    console.error("Error deleting H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete content" },
      { status: 500 }
    );
  }
}`;

// File path
const filePath = path.join(__dirname, '..', 'api', 'admin', 'content', '[id]', 'route.ts');

// Write the updated content to the file
try {
  // Ensure directory exists
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`Successfully updated ${filePath}`);
} catch (error) {
  console.error(`Error updating file: ${error.message}`);
}
