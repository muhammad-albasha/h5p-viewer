import { NextRequest, NextResponse } from "next/server";
import { withBasePath } from "@/app/utils/paths";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v4 as uuidv4 } from "uuid";

/**
 * API route for uploading contact photos
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Upload Photo API] Starting photo upload process");
    
    // Make sure the uploads directory exists
    const uploadDir = join(process.cwd(), "public", "uploads", "contacts");
    if (!existsSync(uploadDir)) {
      console.log(`[Upload Photo API] Creating directory: ${uploadDir}`);
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Parse multipart form data
    const formData = await request.formData();
    const photo = formData.get("photo");
    
    if (!photo || !(photo instanceof File)) {
      console.error("[Upload Photo API] No valid photo file in request");
      return NextResponse.json(
        { error: "No photo file provided" },
        { status: 400 }
      );
    }
    
    // Validate file
    if (photo.size > 5 * 1024 * 1024) {
      console.error("[Upload Photo API] File too large:", photo.size);
      return NextResponse.json(
        { error: "File is too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }
    
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(photo.type)) {
      console.error("[Upload Photo API] Invalid file type:", photo.type);
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG and WebP are allowed." },
        { status: 400 }
      );
    }
    
    // Generate unique filename with original extension
    const fileExtension = photo.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);
    
    // Read the file
    const fileBuffer = Buffer.from(await photo.arrayBuffer());
    
    // Write the file
    await writeFile(filePath, fileBuffer);
    console.log(`[Upload Photo API] File saved to: ${filePath}`);
    
    // Return the URL to the uploaded file
    const relativePath = `/uploads/contacts/${fileName}`;
    const photoUrl = withBasePath(relativePath);
    
    console.log(`[Upload Photo API] File uploaded. Relative path: ${relativePath}, Full URL: ${photoUrl}`);
    
    return NextResponse.json({ 
      photoUrl,
      fileName,
      uploadedTo: relativePath
    });
  } catch (error) {
    console.error("[Upload Photo API] Error handling photo upload:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload photo",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS method to handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  });
}
