import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join("/");

    // Construct the full path to the cover image
    const fullPath = path.join(process.cwd(), "public", "h5p", imagePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(fullPath);

    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
    }

    // Return the image with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error serving cover image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
