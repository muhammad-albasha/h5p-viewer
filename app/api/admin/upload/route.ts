import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import path from "path";
import fs from "fs";
import { pipeline } from "stream/promises";
import { createReadStream, createWriteStream } from "fs";
import crypto from "crypto";
import AdmZip from "adm-zip";
import { ensureDirectoryExists, extractH5PFile, validateH5PFile } from "@/app/utils/h5pExtractor";

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
    }    // Parse the formData
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const file = formData.get('file') as File;
    const subjectAreaId = formData.get('subjectAreaId') as string;
    const tagsString = formData.get('tags') as string;
    
    // Parse tags if provided
    const tagIds: number[] = [];
    if (tagsString) {
      try {
        const parsedTags = JSON.parse(tagsString);
        if (Array.isArray(parsedTags)) {
          parsedTags.forEach(tag => {
            if (typeof tag === 'number') tagIds.push(tag);
          });
        }
      } catch (e) {
        console.error("Failed to parse tags:", e);
      }
    }

    if (!title || !file) {
      return NextResponse.json(
        { error: "Title and file are required" },
        { status: 400 }
      );
    }
    
    // Validate subject area ID if provided
    let validSubjectAreaId: number | null = null;
    if (subjectAreaId && subjectAreaId !== "none") {
      const parsedId = parseInt(subjectAreaId);
      if (!isNaN(parsedId)) {
        validSubjectAreaId = parsedId;
      }
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
      // Write the file to disk (temporary location)
    const tempFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(tempFilePath, fileBuffer);
    
    // Extract the H5P file to public/h5p directory
    try {
      // Create directory for the H5P content in public/h5p
      const h5pDir = path.join(process.cwd(), 'public', 'h5p', slug);
      ensureDirectoryExists(h5pDir);
      // Extract H5P file (which is a ZIP file) to the directory
      const zip = new AdmZip(tempFilePath);
      zip.extractAllTo(h5pDir, true);
      console.log(`H5P file extracted to ${h5pDir}`);

      // === NEU: Cover-Bild speichern, falls vorhanden ===
      const coverImage = formData.get('coverImage') as File | null;
      if (coverImage) {
        const coverArrayBuffer = await coverImage.arrayBuffer();
        const coverBuffer = Buffer.from(coverArrayBuffer);
        const imagesDir = path.join(h5pDir, 'content', 'images');
        ensureDirectoryExists(imagesDir);
        const coverPath = path.join(imagesDir, 'cover.jpg');
        fs.writeFileSync(coverPath, coverBuffer);
      }
      // === ENDE Cover-Bild ===

      // Parse h5p.json to get content type if it exists
      let contentType = "Unknown";
      const h5pJsonPath = path.join(h5pDir, 'h5p.json');
      if (fs.existsSync(h5pJsonPath)) {
        try {
          const h5pJson = JSON.parse(fs.readFileSync(h5pJsonPath, 'utf8'));
          contentType = h5pJson.mainLibrary || contentType;
        } catch (err) {
          console.error(`Error parsing h5p.json for ${slug}:`, err);
        }
      }
        // Save the file info in the database
      const relativeFilePath = `/h5p/${slug}`; // Path to the extracted directory, not the file
      
      // Start a database transaction to handle content and tags
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        
        // Insert content record
        const [result] = await connection.query(
          `INSERT INTO h5p_content (title, slug, file_path, content_type, subject_area_id, created_by) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [title, slug, relativeFilePath, contentType, validSubjectAreaId, session.user.id]
        );
        
        const contentId = (result as any).insertId;
        
        // Insert tags if any
        if (tagIds.length > 0) {
          const tagValues = tagIds.map(tagId => [contentId, tagId]);
          await connection.query(
            'INSERT INTO content_tags (content_id, tag_id) VALUES ?',
            [tagValues]
          );
        }
        
        await connection.commit();
        
        return NextResponse.json({
          message: "Upload successful, H5P content extracted",
          success: true,
          contentId: contentId,
          extractedTo: relativeFilePath
        });
      } catch (dbError) {
        await connection.rollback();
        throw dbError;
      } finally {
        connection.release();
      }
    } catch (extractError: unknown) {
      // If extraction fails, delete the temporary file and throw error
      fs.unlinkSync(tempFilePath);
      const errorMessage = extractError instanceof Error 
        ? extractError.message 
        : String(extractError);
      throw new Error(`Failed to extract H5P file: ${errorMessage}`);
    }

  } catch (error: any) {
    console.error("Error uploading H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
