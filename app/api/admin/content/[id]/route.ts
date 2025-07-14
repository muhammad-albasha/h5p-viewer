import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import {
  H5PContentService,
  TagService,
  SubjectAreaService,
} from "@/app/services";
import fs from "fs";
import path from "path";
import { withBasePath, getPublicPath, getUploadsPath } from "@/app/utils/paths";

// Helper function to safely delete a file
async function deleteFile(filePath: string): Promise<void> {
  try {
    if (!filePath) return;
    
    // Normalize path and remove leading slash if present
    const normalizedPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
    const fullPath = path.join(process.cwd(), "public", normalizedPath);

    if (fs.existsSync(fullPath)) {
      // Check if file is writable before attempting deletion
      await fs.promises.access(fullPath, fs.constants.W_OK);
      await fs.promises.unlink(fullPath);
      console.log(`Deleted file: ${fullPath}`);
    }
  } catch (error) {
    console.warn(`Failed to delete file ${filePath}:`, error);
  }
}

// Helper function to delete H5P content folder
async function deleteH5PContentFolder(slug: string): Promise<void> {
  try {
    if (!slug) return;

    const h5pFolder = getPublicPath("h5p", slug);

    if (fs.existsSync(h5pFolder)) {
      await fs.promises.rm(h5pFolder, { recursive: true, force: true });
      console.log(`Deleted H5P folder: ${h5pFolder}`);
    } else {
      // Check for similar folders (case sensitivity issues)
      const h5pParentDir = getPublicPath("h5p");
      if (fs.existsSync(h5pParentDir)) {
        const allFolders = await fs.promises.readdir(h5pParentDir);
        const similarFolders = allFolders.filter(
          (folder) =>
            folder.toLowerCase() === slug.toLowerCase() ||
            folder.includes(slug)
        );

        for (const folder of similarFolders) {
          const folderPath = path.join(h5pParentDir, folder);
          await fs.promises.rm(folderPath, { recursive: true, force: true });
          console.log(`Deleted similar H5P folder: ${folderPath}`);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to delete H5P folder for slug ${slug}:`, error);
  }
}

// Helper function to cleanup temporary files
async function cleanupTemporaryFiles(slug: string | null, id: number): Promise<void> {
  try {
    const tempFolderBase = getUploadsPath("h5p");
    
    if (!fs.existsSync(tempFolderBase)) return;

    const tempItems = await fs.promises.readdir(tempFolderBase);

    for (const item of tempItems) {
      const itemPath = path.join(tempFolderBase, item);
      const stats = await fs.promises.stat(itemPath);
      
      // Match by slug, or by ID if slug is undefined/null
      const shouldDelete = slug
        ? item.includes(slug) || item.startsWith(slug)
        : item.includes(id.toString()) || item.endsWith(`-${id}.h5p`);

      if (shouldDelete) {
        if (stats.isDirectory()) {
          await fs.promises.rm(itemPath, { recursive: true, force: true });
        } else {
          await fs.promises.unlink(itemPath);
        }
        console.log(`Deleted temporary item: ${itemPath}`);
      }
    }
  } catch (error) {
    console.warn(`Failed to cleanup temporary files:`, error);
  }
}

// DELETE endpoint to remove H5P content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid content ID" },
        { status: 400 }
      );
    }

    const h5pContentService = new H5PContentService();

    // Get content info before deletion
    const content = await h5pContentService.findById(id);
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    try {
      // Delete all associated files systematically
      
      // 1. Delete the uploaded file if it exists
      if (content.filePath) {
        await deleteFile(content.filePath);
      }

      // 2. Delete cover image if it exists
      if (content.coverImagePath) {
        await deleteFile(content.coverImagePath);
      }

      // 3. Delete H5P content folder from public/h5p
      if (content.slug) {
        await deleteH5PContentFolder(content.slug);
      }

      // 4. Delete any temporary files
      await cleanupTemporaryFiles(content.slug, id);

    } catch (fsError) {
      console.warn("File system cleanup encountered errors:", fsError);
      // Continue with database deletion even if file cleanup fails
    }

    // Delete from database using TypeORM service
    const deleted = await h5pContentService.delete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete content from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete content" },
      { status: 500 }
    );
  }
}

// PUT endpoint to update H5P content metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid content ID" },
        { status: 400 }
      );
    }
    let title = "";
    let description = "";
    let subject_area_id: string | null = null;
    let tags: number[] = [];
    let coverImage: File | null = null;
    let password = "";

    // Detect content type and parse accordingly
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = formData.get("title") as string;
      description = (formData.get("description") as string) || "";
      subject_area_id = formData.get("subject_area_id") as string;
      password = (formData.get("password") as string) || "";
      const tagsString = formData.get("tags") as string;
      if (tagsString) {
        try {
          const parsedTags = JSON.parse(tagsString);
          if (Array.isArray(parsedTags)) {
            tags = parsedTags;
          }
        } catch (e) {
          // Failed to parse tags, using empty array
        }
      }
      coverImage = formData.get("coverImage") as File | null;
    } else {
      // fallback: JSON
      let reqData;
      try {
        reqData = await request.json();
      } catch (err) {
        return NextResponse.json(
          { error: "Invalid request data format" },
          { status: 400 }
        );
      }
      title = reqData.title;
      description = reqData.description || "";
      subject_area_id = reqData.subject_area_id;
      password = reqData.password || "";
      tags = reqData.tags || [];
    }

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const h5pContentService = new H5PContentService();

    // Check if content exists and get slug
    const content = await h5pContentService.findById(id);
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const slug = content.slug; // === Save cover image if provided ===
    if (coverImage && slug) {
      try {
        const coverArrayBuffer = await coverImage.arrayBuffer();
        const coverBuffer = Buffer.from(coverArrayBuffer);

        // Find the actual H5P directory (handle potential slug/directory mismatches)
        const h5pBaseDir = path.join(process.cwd(), "public", "h5p");
        let actualSlug = slug;

        // Check if directory with exact slug exists
        const exactSlugDir = path.join(h5pBaseDir, slug);
        if (!fs.existsSync(exactSlugDir)) {
          // Look for directories that start with the slug
          if (fs.existsSync(h5pBaseDir)) {
            const allDirs = fs
              .readdirSync(h5pBaseDir, { withFileTypes: true })
              .filter((dirent) => dirent.isDirectory())
              .map((dirent) => dirent.name);

            const matchingDir = allDirs.find(
              (dir) => dir.startsWith(slug + "-") || dir === slug
            );

            if (matchingDir) {
              actualSlug = matchingDir;
            }
          }
        }

        const imagesDir = path.join(
          h5pBaseDir,
          actualSlug,
          "content",
          "images"
        );
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }
        const coverPath = path.join(imagesDir, "cover.jpg");
        fs.writeFileSync(coverPath, coverBuffer);

        // Update the cover image path in database
        await h5pContentService.update(id, {
          coverImagePath: withBasePath(`/api/h5p/cover/${actualSlug}/content/images/cover.jpg`),
        });
      } catch (err) {
        console.error("Error saving cover image:", err);
        // Continue with update even if cover image fails
      }
    } // Update content using TypeORM service
    const subjectAreaId =
      subject_area_id && subject_area_id !== "none"
        ? parseInt(subject_area_id)
        : undefined;
    const updatedContent = await h5pContentService.update(id, {
      title: title.trim(),
      description: description.trim() || undefined,
      subjectAreaId,
      tagIds: tags.length > 0 ? tags : undefined,
      password: password || undefined,
    });

    if (!updatedContent) {
      return NextResponse.json(
        { error: "Failed to update content" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      id,
      title: updatedContent.title,
      subject_area_id: updatedContent.subjectAreaId || null,
      tags: updatedContent.tags?.map((tag) => tag.id) || [],
      updated_at: updatedContent.updatedAt,
    });
  } catch (error: any) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update content" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve a single H5P content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid content ID" },
        { status: 400 }
      );
    }

    const h5pContentService = new H5PContentService();
    const tagService = new TagService();
    const subjectAreaService = new SubjectAreaService();

    // Get content with all relationships
    const content = await h5pContentService.findByIdWithDetails(id);
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Get all available tags for the dropdown
    const allTags = await tagService.findAll();

    // Get all subject areas for the dropdown
    const subjectAreas = await subjectAreaService.findAll(); // Format content data to match existing API
    const contentData = {
      id: content.id,
      title: content.title,
      description: content.description,
      slug: content.slug,
      file_path: content.filePath,
      content_type: content.contentType,
      created_at: content.createdAt,
      subject_area_id: content.subjectAreaId || null,
      subject_area_name: content.subjectArea?.name || null,
      cover_image_path: content.coverImagePath,
      password: content.password,
      tags:
        content.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })) || [],
    };

    return NextResponse.json({
      content: contentData,
      allTags: allTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      })),
      subjectAreas: subjectAreas.map((sa) => ({
        id: sa.id,
        name: sa.name,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch content" },
      { status: 500 }
    );
  }
}
