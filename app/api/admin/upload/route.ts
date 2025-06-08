import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { H5PContentService } from "@/app/services";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import AdmZip from "adm-zip";
import { ensureDirectoryExists } from "@/app/utils/h5pExtractor";

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
          parsedTags.forEach(tag => {          if (typeof tag === 'number') tagIds.push(tag);
          });
        }
      } catch (e) {
        // Failed to parse tags, continue with empty tags
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
      zip.extractAllTo(h5pDir, true);      // H5P file extracted successfully

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
          contentType = h5pJson.mainLibrary || contentType;        } catch (err) {
          // Error parsing h5p.json, using default metadata
        }
      }        // Save the file info in the database using TypeORM
        const relativeFilePath = `/h5p/${slug}`; // Path to the extracted directory, not the file
        
        try {
          const h5pContentService = new H5PContentService();
            const newContent = await h5pContentService.create({
            title,
            filePath: relativeFilePath,
            contentType,
            subjectAreaId: validSubjectAreaId || undefined,
            createdById: typeof session.user.id === 'string' ? parseInt(session.user.id) : session.user.id,
            tagIds: tagIds.length > 0 ? tagIds : undefined
          });
          
          return NextResponse.json({
            message: "Upload successful, H5P content extracted",
            success: true,
            contentId: newContent.id,
            extractedTo: relativeFilePath
          });
        } catch (dbError) {
          // If database save fails, clean up extracted files
          if (fs.existsSync(h5pDir)) {
            fs.rmSync(h5pDir, { recursive: true, force: true });
          }
          throw dbError;
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
    // Error uploading H5P content
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
