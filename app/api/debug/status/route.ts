import { NextRequest, NextResponse } from "next/server";

/**
 * Simple API health check for production environment
 * This endpoint should work regardless of other configuration issues
 */
export async function GET() {
  try {
    // Basic server information that doesn't rely on filesystem
    const info = {
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
      basePath: process.env.NEXT_PUBLIC_BASE_PATH || "/h5p-viewer",
      nextVersion: process.env.NEXT_VERSION || "unknown",
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
    };
    
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: String(error) },
      { status: 500 }
    );
  }
}
