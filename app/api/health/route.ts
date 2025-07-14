import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/app/lib/datasource";
import fs from "fs";
import path from "path";
import { getPublicPath } from "@/app/utils/paths";

export async function GET(request: NextRequest) {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "unknown",
    checks: {
      database: false,
      fileSystem: false,
      uploads: false,
      h5pContent: false,
    },
    errors: [] as string[],
  };

  try {
    // Check database connection
    try {
      const dataSource = await getDataSource();
      if (dataSource.isInitialized) {
        checks.checks.database = true;
      } else {
        checks.errors.push("Database not initialized");
      }
    } catch (error) {
      checks.errors.push(`Database error: ${error}`);
    }

    // Check file system access
    try {
      const publicPath = getPublicPath();
      await fs.promises.access(publicPath, fs.constants.R_OK | fs.constants.W_OK);
      checks.checks.fileSystem = true;
    } catch (error) {
      checks.errors.push(`File system error: ${error}`);
    }

    // Check uploads directory
    try {
      const uploadsPath = getPublicPath("uploads");
      await fs.promises.access(uploadsPath, fs.constants.R_OK | fs.constants.W_OK);
      checks.checks.uploads = true;
    } catch (error) {
      checks.errors.push(`Uploads directory error: ${error}`);
    }

    // Check H5P content directory
    try {
      const h5pPath = getPublicPath("h5p");
      await fs.promises.access(h5pPath, fs.constants.R_OK | fs.constants.W_OK);
      checks.checks.h5pContent = true;
    } catch (error) {
      checks.errors.push(`H5P content directory error: ${error}`);
    }

    // Determine overall status
    const allChecksPass = Object.values(checks.checks).every(check => check);
    if (!allChecksPass) {
      checks.status = "degraded";
    }

    if (checks.errors.length > 0) {
      checks.status = checks.errors.length > 2 ? "unhealthy" : "degraded";
    }

    const statusCode = checks.status === "ok" ? 200 : checks.status === "degraded" ? 200 : 503;

    return NextResponse.json(checks, { status: statusCode });

  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
