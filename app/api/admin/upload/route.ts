import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { H5PContentService } from "@/app/services";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import AdmZip from "adm-zip";
import { ensureDirectoryExists } from "@/app/utils/h5pExtractor";
import { ensureRequiredDirectories, getSystemInfo } from "@/app/utils/systemUtils";

// Helper function to create a slug from a title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Test GET handler to check if API is reachable
export async function GET(req: NextRequest) {
  console.log("=== Upload API GET test ===");
  console.log("Request URL:", req.url);
  
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    message: "Upload API is reachable",
    authenticated: !!session,
    role: session?.user?.role,
    timestamp: new Date().toISOString(),
    systemInfo: getSystemInfo()
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log("=== Upload API called ===");
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    console.log("System info:", getSystemInfo());
    
    // Ensure required directories exist
    ensureRequiredDirectories();
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log("Session check:", { hasSession: !!session, role: session?.user?.role });
    
    if (!session || session.user.role !== "admin") {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }    // Parse the formData
    console.log("Parsing form data...");
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;
    const subjectAreaId = formData.get("subjectAreaId") as string;
    const tagsString = formData.get("tags") as string;
    const password = formData.get("password") as string;
    
    console.log("Form data parsed:", { title, hasFile: !!file, subjectAreaId, tagsString });// Parse tags if provided
    const tagIds: number[] = [];
    if (tagsString) {
      try {
        const parsedTags = JSON.parse(tagsString);
        if (Array.isArray(parsedTags)) {
          parsedTags.forEach((tag) => {
            if (typeof tag === "number") tagIds.push(tag);
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
    } // Validate subject area ID if provided
    let validSubjectAreaId: number | null = null;
    if (subjectAreaId && subjectAreaId !== "none") {
      const parsedId = parseInt(subjectAreaId);
      if (!isNaN(parsedId)) {
        validSubjectAreaId = parsedId;
      }
    }

    // Create unique slug and folder name
    console.log("Creating slug...");
    const baseSlug = createSlug(title);
    const uniqueId = crypto.randomBytes(4).toString("hex");
    const slug = `${baseSlug}-${uniqueId}`;
    console.log("Generated slug:", slug);

    // Create a name for the file in the public directory
    const fileName = `${slug}.h5p`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "h5p");
    console.log("Upload directory:", uploadDir);

    // Ensure the directory exists
    console.log("Ensuring upload directory exists...");
    try {
      ensureDirectoryExists(uploadDir);
    } catch (dirError) {
      console.error("Failed to create upload directory:", dirError);
      throw new Error(`Cannot create upload directory: ${uploadDir}`);
    }

    // Get file data as ArrayBuffer
    console.log("Reading file data...");
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);
    
    // Write the file to disk (temporary location)
    const tempFilePath = path.join(uploadDir, fileName);
    console.log("Writing temp file to:", tempFilePath);
    try {
      fs.writeFileSync(tempFilePath, fileBuffer, { mode: 0o644 });
      console.log("Temp file written successfully");
    } catch (writeError) {
      console.error("Failed to write temp file:", writeError);
      throw new Error(`Cannot write file to: ${tempFilePath}`);
    }

    // Extract the H5P file to public/h5p directory
    try {
      console.log("Starting H5P extraction...");
      // Create directory for the H5P content in public/h5p
      const h5pDir = path.join(process.cwd(), "public", "h5p", slug);
      console.log("H5P directory:", h5pDir);
      ensureDirectoryExists(h5pDir);
      
      // Extract H5P file (which is a ZIP file) to the directory
      console.log("Extracting ZIP file...");
      const zip = new AdmZip(tempFilePath);
      zip.extractAllTo(h5pDir, true);
      console.log("H5P file extracted successfully");      // === Cover-Bild verarbeiten ===
      let coverImagePath: string | undefined;

      // 1. Prüfen ob ein Cover-Bild hochgeladen wurde
      const coverImage = formData.get("coverImage") as File | null;
      if (coverImage) {
        const coverArrayBuffer = await coverImage.arrayBuffer();
        const coverBuffer = Buffer.from(coverArrayBuffer);
        const imagesDir = path.join(h5pDir, "content", "images");
        ensureDirectoryExists(imagesDir);
        const coverPath = path.join(imagesDir, "cover.jpg");
        fs.writeFileSync(coverPath, coverBuffer);
        coverImagePath = `/h5p-viewer/api/h5p/cover/${slug}/content/images/cover.jpg`;
      } else {
        // 2. Prüfen ob im extrahierten H5P bereits ein cover.jpg existiert
        const extractedCoverPath = path.join(
          h5pDir,
          "content",
          "images",
          "cover.jpg"
        );
        if (fs.existsSync(extractedCoverPath)) {
          coverImagePath = `/h5p-viewer/api/h5p/cover/${slug}/content/images/cover.jpg`;
        }
      }
      // === ENDE Cover-Bild ===      // Parse h5p.json to get content type if it exists
      let contentType = "Unknown";
      const h5pJsonPath = path.join(h5pDir, "h5p.json");
      if (fs.existsSync(h5pJsonPath)) {
        try {
          const h5pJson = JSON.parse(fs.readFileSync(h5pJsonPath, "utf8"));
          contentType = h5pJson.mainLibrary || contentType;
        } catch (err) {
          // Error parsing h5p.json, using default metadata
        }
      }

      // Save the file info in the database using TypeORM
      const relativeFilePath = `/h5p/${slug}`; // Path to the extracted directory, not the file

      try {
        const h5pContentService = new H5PContentService();
        const newContent = await h5pContentService.create({
          title,
          description: description || undefined,
          filePath: relativeFilePath,
          coverImagePath, // Cover-Bild-Pfad hinzufügen
          contentType,
          subjectAreaId: validSubjectAreaId || undefined,
          createdById:
            typeof session.user.id === "string"
              ? parseInt(session.user.id)
              : session.user.id,
          tagIds: tagIds.length > 0 ? tagIds : undefined,
          password: password || undefined,
        });
        return NextResponse.json({
          message: "Upload successful, H5P content extracted",
          success: true,
          contentId: newContent.id,
          extractedTo: relativeFilePath,
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
      const errorMessage =
        extractError instanceof Error
          ? extractError.message
          : String(extractError);
      throw new Error(`Failed to extract H5P file: ${errorMessage}`);
    }    } catch (error: any) {
      console.error("=== Upload API error ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Error details:", error);
      console.error("========================");
      
      // Error uploading H5P content
      return NextResponse.json(
        { 
          error: error.message || "Upload failed",
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
}
