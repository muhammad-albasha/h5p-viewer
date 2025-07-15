import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join("/");
    const fullPath = path.join(process.cwd(), "public", "h5p", filePath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "H5P file not found" },
        { status: 404 }
      );
    }

    // Check if it's a directory (return 404 for directories)
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      return NextResponse.json(
        { error: "Path is a directory" },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = fs.readFileSync(fullPath);
    
    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = "application/octet-stream";
    
    switch (ext) {
      case ".json":
        contentType = "application/json";
        break;
      case ".js":
        contentType = "application/javascript";
        break;
      case ".css":
        contentType = "text/css";
        break;
      case ".html":
        contentType = "text/html";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".svg":
        contentType = "image/svg+xml";
        break;
      case ".mp4":
        contentType = "video/mp4";
        break;
      case ".mp3":
        contentType = "audio/mpeg";
        break;
      case ".woff":
        contentType = "font/woff";
        break;
      case ".woff2":
        contentType = "font/woff2";
        break;
      case ".ttf":
        contentType = "font/ttf";
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving H5P file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
