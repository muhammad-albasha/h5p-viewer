import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { existsSync } from "fs";
import { readFile } from "fs/promises";

/**
 * API route for serving debug photos directly from the API
 * This can be used to test if photos are accessible through Next.js API routes
 * and bypass any web server configuration issues
 */
export async function GET(request: NextRequest) {
  try {
    // Get the photo filename from the query parameter
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    
    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 });
    }
    
    // Validate filename to prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }
    
    // Construct the file path
    const contactsDir = path.join(process.cwd(), "public", "uploads", "contacts");
    const filePath = path.join(contactsDir, filename);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ 
        error: "File not found", 
        path: filePath,
        publicPath: `/uploads/contacts/${filename}`,
      }, { status: 404 });
    }
    
    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    let contentType = "application/octet-stream";
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      contentType = "image/jpeg";
    } else if (filename.endsWith('.png')) {
      contentType = "image/png";
    } else if (filename.endsWith('.webp')) {
      contentType = "image/webp";
    } else if (filename.endsWith('.gif')) {
      contentType = "image/gif";
    }
    
    // Use NextResponse.raw to serve the image directly
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", fileBuffer.length.toString());
    headers.set("Cache-Control", "public, max-age=60");
    headers.set("Access-Control-Allow-Origin", "*");
    
    // Return the image directly via the API
    return new NextResponse(fileBuffer as unknown as ReadableStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error serving debug photo:", error);
    return NextResponse.json(
      { 
        error: "Failed to serve photo",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
