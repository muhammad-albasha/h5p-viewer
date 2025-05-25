import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";
import crypto from "crypto";

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper function to create a slug from a title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the formData
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File;

    if (!title || !file) {
      return NextResponse.json(
        { error: "Title and file are required" },
        { status: 400 }
      );
    }

    // Create unique slug and folder name
    const baseSlug = createSlug(title);
    const uniqueId = crypto.randomBytes(4).toString('hex');
    const slug = `${baseSlug}-${uniqueId}`;
    
    // Create a name for the file in the public directory
    const fileName = `${slug}.h5p`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'h5p');
    
    // Ensure the directory exists
    ensureDirectoryExists(uploadDir);
    
    // Get file data as ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    
    // Write the file to disk
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, fileBuffer);
    
    // Save the file info in the database
    const relativeFilePath = `/uploads/h5p/${fileName}`;
    const [result] = await pool.query(
      `INSERT INTO h5p_content (title, slug, file_path, created_by) 
       VALUES (?, ?, ?, ?)`,
      [title, slug, relativeFilePath, session.user.id]
    );

    return NextResponse.json({
      message: "Upload successful",
      success: true,
      contentId: (result as any).insertId
    });

  } catch (error: any) {
    console.error("Error uploading H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
