import { NextRequest, NextResponse } from "next/server";

/**
 * Debug endpoint to check H5P path construction
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    
    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }
    
    let correctPath = path;
    
    // Process the path as in the PlayH5p component
    if (correctPath.endsWith("/h5p.json")) {
      correctPath = correctPath.substring(0, correctPath.length - 9);
    }
    
    if (correctPath.startsWith("/h5p/")) {
      correctPath = correctPath.substring(5);
    }
    
    if (correctPath.includes("://")) {
      const url = new URL(correctPath);
      correctPath = url.pathname;
      
      if (correctPath.startsWith("/h5p/")) {
        correctPath = correctPath.substring(5);
      }
    }
    
    if (correctPath.endsWith("/")) {
      correctPath = correctPath.substring(0, correctPath.length - 1);
    }
    
    return NextResponse.json({
      original: path,
      processed: correctPath,
      apiPath: `/api/h5p/${correctPath}`,
      basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/h5p-viewer",
      fullPath: `${process.env.NEXT_PUBLIC_BASE_PATH || "/h5p-viewer"}/api/h5p/${correctPath}`
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process path", details: String(error) },
      { status: 500 }
    );
  }
}
