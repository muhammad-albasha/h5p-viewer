// filepath: c:\Users\Muhammad\Documents\h5p-viewer\app\api\admin\content\[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";
import fs from "fs";
import path from "path";

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
    const id = resolvedParams.id;
    // Deleting content with specified ID

    let content;
    try {
      // Get content info before deletion
      [content] = await pool.query(
        "SELECT file_path, slug FROM h5p_content WHERE id = ?",
        [id]
      );
      // Content query executed
    } catch (err) {
      // Database error fetching content for deletion
      return NextResponse.json(
        { error: "Database error when fetching content" },
        { status: 500 }
      );
    }

    if (Array.isArray(content) && content.length === 0) {
      // Content not found
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }    // Make sure we have valid content info before proceeding
    const contentArray = content as any[];
    if (!contentArray || !contentArray[0]) {
      // Invalid content data
      return NextResponse.json(
        { error: "Content data invalid" },
        { status: 500 }
      );
    }
    
    // Check if required properties exist
    if (!contentArray[0].hasOwnProperty('slug')) {
      // Content data missing slug property, continue anyway
    }try {
      // Delete all associated files
      const contentItem = contentArray[0] as Record<string, any>;
      
      // 1. Delete the uploaded file if it exists
      const filePath = contentItem.file_path;
      if (filePath) {        // Ensure path is properly formatted, remove leading slash if present
        const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        const fullPath = path.join(process.cwd(), "public", normalizedPath);
        // Checking if uploaded file exists
        
        try {
          if (fs.existsSync(fullPath)) {
            // Check if file is writable before attempting deletion
            fs.accessSync(fullPath, fs.constants.W_OK);
            fs.unlinkSync(fullPath);
            // Uploaded file deleted successfully
          } else {
            // Uploaded file not found
          }
        } catch (err) {
          // Error deleting file, continue with other cleanup
        }      }
      
      // 2. Delete folder from public/h5p if it exists (contains the extracted H5P content)
      const slug = contentItem.slug;
      if (slug) {
        const h5pFolder = path.join(process.cwd(), "public", "h5p", slug);
        // Checking if H5P content folder exists
        
        try {
          if (fs.existsSync(h5pFolder)) {
            // Forcefully delete directory and all contents
            fs.rmSync(h5pFolder, { recursive: true, force: true });
            // H5P content folder deleted successfully
          } else {
            // H5P content folder not found, checking for similar folders
            
            // Check if there's a folder with similar name (case sensitivity issues)
            const h5pParentDir = path.join(process.cwd(), "public", "h5p");
            if (fs.existsSync(h5pParentDir)) {
              const allFolders = fs.readdirSync(h5pParentDir);
              const similarFolders = allFolders.filter(folder => 
                folder.toLowerCase() === slug.toLowerCase() ||
                folder.includes(slug)
              );
              
              for (const folder of similarFolders) {
                const folderPath = path.join(h5pParentDir, folder);
                // Found similar H5P folder, deleting
                fs.rmSync(folderPath, { recursive: true, force: true });
              }
            }
          }
        } catch (err) {
          // Error deleting H5P folder, continue with cleanup
        }
      }
      
      // 3. Delete any temporary folders that might have been created during upload
      const tempFolderBase = path.join(process.cwd(), "public", "uploads", "h5p");
      if (fs.existsSync(tempFolderBase)) {
        try {
          // Look for temporary folders and files that match the slug pattern
          const tempItems = fs.readdirSync(tempFolderBase);
          
          // Filter both files and folders that might be related
          for (const item of tempItems) {
            const itemPath = path.join(tempFolderBase, item);
            const isDirectory = fs.statSync(itemPath).isDirectory();
              // Match by slug, or by ID if slug is undefined/null
            const shouldDelete = slug ? 
              (item.includes(slug) || item.startsWith(slug)) :
              (item.includes(id) || item.endsWith(`-${id}.h5p`));
            
            if (shouldDelete) {
              // Deleting temporary file or folder
              
              if (isDirectory) {
                fs.rmSync(itemPath, { recursive: true, force: true });
              } else {
                fs.unlinkSync(itemPath);
              }
            }
          }
        } catch (tempErr) {
          // Error cleaning up temporary files, continue with database deletion
        }
      }
    } catch (fsError) {
      // File system error during deletion, continue with database deletion
    }

    // Begin database transaction
    let connection;
    try {
      connection = await pool.getConnection();
      // Database connection established for deletion
    } catch (dbConnErr) {
      // Error getting database connection for deletion
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    try {
      await connection.beginTransaction();
      // Transaction started for deletion
      
      // Delete content tags first
      await connection.query("DELETE FROM content_tags WHERE content_id = ?", [id]);
      // Content tags deleted
      
      // Delete from content table
      const [result] = await connection.query("DELETE FROM h5p_content WHERE id = ?", [id]);
      // Content deleted from database
      
      await connection.commit();
      // Transaction committed
    } catch (error) {
      // Transaction error during deletion
      if (connection) {
        try {
          await connection.rollback();
          // Transaction rolled back
        } catch (rollbackErr) {
          // Error during rollback
        }
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
        // Database connection released
      }
    }

    // Content successfully deleted
    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (error: any) {
    // Error deleting H5P content
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
    const id = resolvedParams.id;
    // Updating content with specified ID

    let title = "";
    let subject_area_id: string | null = null;
    let tags: number[] = [];
    let coverImage: File | null = null;
    let isMultipart = false;

    // Detect content type and parse accordingly
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      isMultipart = true;
      const formData = await request.formData();
      title = formData.get("title") as string;
      subject_area_id = formData.get("subject_area_id") as string;
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
      subject_area_id = reqData.subject_area_id;
      tags = reqData.tags || [];
    }

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Check if content exists and get slug
    let contentCheck;
    let slug = null;
    try {
      [contentCheck] = await pool.query(
        "SELECT id, slug FROM h5p_content WHERE id = ?",
        [id]
      );
      if (Array.isArray(contentCheck) && contentCheck.length > 0) {
        // MySQL2 returns RowDataPacket[]
        const row = contentCheck[0] as { id: number; slug: string };
        slug = row.slug;
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Database error when checking content" },
        { status: 500 }
      );
    }
    if (!slug) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // === Save cover image if provided ===
    if (coverImage && slug) {
      try {
        const coverArrayBuffer = await coverImage.arrayBuffer();
        const coverBuffer = Buffer.from(coverArrayBuffer);
        const imagesDir = path.join(process.cwd(), 'public', 'h5p', slug, 'content', 'images');
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });        }
        const coverPath = path.join(imagesDir, 'cover.jpg');
        fs.writeFileSync(coverPath, coverBuffer);
        // Cover image updated successfully
      } catch (err) {
        // Error saving cover image, continue with update
      }
    }
    // === End cover image ===

    // Begin transaction
    let connection;
    try {
      connection = await pool.getConnection();
    } catch (err) {
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }
    try {
      await connection.beginTransaction();
      await connection.query(
        "UPDATE h5p_content SET title = ?, subject_area_id = ? WHERE id = ?",
        [title, subject_area_id || null, id]
      );
      await connection.query("DELETE FROM content_tags WHERE content_id = ?", [id]);
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const tagValues = tags.map(tagId => [id, tagId]);
        await connection.query(
          "INSERT INTO content_tags (content_id, tag_id) VALUES ?",
          [tagValues]
        );
      }
      await connection.commit();
    } catch (error) {
      if (connection) {
        try { await connection.rollback(); } catch {}
      }
      throw error;
    } finally {
      if (connection) connection.release();
    }
    return NextResponse.json({ id, title, subject_area_id, tags, updated_at: new Date() });
  } catch (error: any) {
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
    const id = resolvedParams.id;
    // Fetching content with specified ID

    // Get content with subject area and tags
    let contentResult;
    try {
      [contentResult] = await pool.query(`
        SELECT 
          h.id,
          h.title,
          h.slug,
          h.file_path,
          h.content_type,
          h.created_at,
          h.subject_area_id,
          sa.name AS subject_area_name
        FROM 
          h5p_content h
        LEFT JOIN 
          subject_areas sa ON h.subject_area_id = sa.id
        WHERE 
          h.id = ?
      `, [id]);
      // Content query completed
    } catch (err) {
      // Database error fetching content
      return NextResponse.json(
        { error: "Database error when fetching content" },
        { status: 500 }
      );
    }    if (!Array.isArray(contentResult) || contentResult.length === 0) {
      // Content not found
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Get tags for this content
    let contentTags;
    try {
      [contentTags] = await pool.query(`
        SELECT 
          t.id,
          t.name
        FROM 
          tags t
        INNER JOIN 
          content_tags ct ON t.id = ct.tag_id
        WHERE 
          ct.content_id = ?        ORDER BY 
          t.name
      `, [id]);
      // Tags query completed
    } catch (err) {
      // Database error fetching content tags
      // Continue even if tags query fails
      contentTags = [];
    }

    // Get all available tags for the dropdown
    let allTags;
    try {
      [allTags] = await pool.query(`
        SELECT id, name
        FROM tags
        ORDER BY name      `);
    } catch (err) {
      // Database error fetching all tags
      // Continue even if this query fails
      allTags = [];
    }

    // Get all subject areas for the dropdown
    let subjectAreas;
    try {
      [subjectAreas] = await pool.query(`
        SELECT id, name
        FROM subject_areas
        ORDER BY name
      `);
    } catch (err) {
      // Database error fetching subject areas
      // Continue even if this query fails
      subjectAreas = [];
    }

    const contentData = (contentResult as any[])[0];
    
    // Check if contentData is valid before adding the tags property
    if (!contentData) {
      // contentData is null or undefined
      return NextResponse.json(
        { error: "Content data could not be processed" },
        { status: 500 }
      );
    }
    
    // Safely add tags to content data
    contentData.tags = contentTags || [];

    // Successfully prepared content response
    return NextResponse.json({
      content: contentData,
      allTags: allTags || [],      subjectAreas: subjectAreas || []
    });
  } catch (error: any) {
    // Error fetching H5P content
    return NextResponse.json(
      { error: error.message || "Failed to fetch content" },
      { status: 500 }
    );
  }
}
