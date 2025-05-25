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
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    console.log(`Deleting content with ID: ${id}`);

    let content;
    try {
      // Get content info before deletion
      [content] = await pool.query(
        "SELECT file_path, slug FROM h5p_content WHERE id = ?",
        [id]
      );
      console.log(`Content query result: ${JSON.stringify(content)}`);
    } catch (err) {
      console.error("Database error fetching content for deletion:", err);
      return NextResponse.json(
        { error: "Database error when fetching content" },
        { status: 500 }
      );
    }

    if (Array.isArray(content) && content.length === 0) {
      console.log(`Content with ID ${id} not found`);
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }    // Make sure we have valid content info before proceeding
    const contentArray = content as any[];
    if (!contentArray || !contentArray[0]) {
      console.error("Invalid content data:", content);
      return NextResponse.json(
        { error: "Content data invalid" },
        { status: 500 }
      );
    }
    
    // Check if required properties exist
    if (!contentArray[0].hasOwnProperty('slug')) {
      console.error("Content data missing slug property:", contentArray[0]);
      // Continue even if slug is missing
    }    try {
      // Delete all associated files
      const contentItem = contentArray[0] as Record<string, any>;
      
      // 1. Delete the uploaded file if it exists
      const filePath = contentItem.file_path;
      if (filePath) {
        // Ensure path is properly formatted, remove leading slash if present
        const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        const fullPath = path.join(process.cwd(), "public", normalizedPath);
        console.log(`Checking if uploaded file exists at: ${fullPath}`);
        
        try {
          if (fs.existsSync(fullPath)) {
            // Check if file is writable before attempting deletion
            fs.accessSync(fullPath, fs.constants.W_OK);
            fs.unlinkSync(fullPath);
            console.log(`Uploaded file deleted: ${fullPath}`);
          } else {
            console.log(`Uploaded file not found at ${fullPath}`);
          }
        } catch (err) {
          console.error(`Error deleting file ${fullPath}:`, err);
        }
      }
      
      // 2. Delete folder from public/h5p if it exists (contains the extracted H5P content)
      const slug = contentItem.slug;
      if (slug) {
        const h5pFolder = path.join(process.cwd(), "public", "h5p", slug);
        console.log(`Checking if H5P content folder exists at: ${h5pFolder}`);
        
        try {
          if (fs.existsSync(h5pFolder)) {
            // Forcefully delete directory and all contents
            fs.rmSync(h5pFolder, { recursive: true, force: true });
            console.log(`H5P content folder deleted: ${h5pFolder}`);
          } else {
            console.log(`H5P content folder not found at ${h5pFolder}`);
            
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
                console.log(`Found similar H5P folder, deleting: ${folderPath}`);
                fs.rmSync(folderPath, { recursive: true, force: true });
              }
            }
          }
        } catch (err) {
          console.error(`Error deleting H5P folder ${h5pFolder}:`, err);
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
              console.log(`Deleting temporary ${isDirectory ? 'folder' : 'file'}: ${itemPath}`);
              
              if (isDirectory) {
                fs.rmSync(itemPath, { recursive: true, force: true });
              } else {
                fs.unlinkSync(itemPath);
              }
            }
          }
        } catch (tempErr) {
          console.error("Error cleaning up temporary files:", tempErr);
          // Don't throw - continue with database deletion
        }
      }
    } catch (fsError) {
      // Log the error but continue with database deletion
      console.error("File system error during deletion:", fsError);
    }

    // Begin database transaction
    let connection;
    try {
      connection = await pool.getConnection();
      console.log("Database connection established for deletion");
    } catch (dbConnErr) {
      console.error("Error getting database connection for deletion:", dbConnErr);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    try {
      await connection.beginTransaction();
      console.log("Transaction started for deletion");
      
      // Delete content tags first
      await connection.query("DELETE FROM content_tags WHERE content_id = ?", [id]);
      console.log("Content tags deleted");
      
      // Delete from content table
      const [result] = await connection.query("DELETE FROM h5p_content WHERE id = ?", [id]);
      console.log("Content deleted from database", result);
      
      await connection.commit();
      console.log("Transaction committed");
    } catch (error) {
      console.error("Transaction error during deletion:", error);
      if (connection) {
        try {
          await connection.rollback();
          console.log("Transaction rolled back");
        } catch (rollbackErr) {
          console.error("Error during rollback:", rollbackErr);
        }
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
        console.log("Database connection released");
      }
    }

    console.log(`Content with ID ${id} successfully deleted`);
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
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    console.log(`Updating content with ID: ${id}`);

    // Get updated content data
    let reqData;
    try {
      reqData = await request.json();
      console.log("Request data parsed successfully");
    } catch (err) {
      console.error("Error parsing request JSON:", err);
      return NextResponse.json(
        { error: "Invalid request data format" },
        { status: 400 }
      );
    }

    const { title, subject_area_id, tags } = reqData;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Check if content exists
    let contentCheck;
    try {
      [contentCheck] = await pool.query(
        "SELECT id FROM h5p_content WHERE id = ?",
        [id]
      );
      console.log(`Content check completed, result length: ${(contentCheck as any[]).length}`);
    } catch (err) {
      console.error("Database error checking content existence:", err);
      return NextResponse.json(
        { error: "Database error when checking content" },
        { status: 500 }
      );
    }

    if (Array.isArray(contentCheck) && contentCheck.length === 0) {
      console.log("Content not found");
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Begin transaction
    let connection;
    try {
      connection = await pool.getConnection();
      console.log("Database connection established");
    } catch (err) {
      console.error("Error getting database connection:", err);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 500 }
      );
    }

    try {
      await connection.beginTransaction();
      console.log("Transaction started");
      
      // Update content basic info
      await connection.query(
        "UPDATE h5p_content SET title = ?, subject_area_id = ? WHERE id = ?",
        [title, subject_area_id || null, id]
      );
      console.log("Content basic info updated");
      
      // Update tags - first delete existing tags
      await connection.query("DELETE FROM content_tags WHERE content_id = ?", [id]);
      console.log("Existing tags deleted");
      
      // Then add new tags if provided
      if (tags && Array.isArray(tags) && tags.length > 0) {
        console.log(`Adding ${tags.length} new tags`);
        const tagValues = tags.map(tagId => [id, tagId]);
        await connection.query(
          "INSERT INTO content_tags (content_id, tag_id) VALUES ?",
          [tagValues]
        );
        console.log("New tags added");
      } else {
        console.log("No tags to add");
      }
      
      await connection.commit();
      console.log("Transaction committed");
    } catch (error) {
      console.error("Transaction error:", error);
      if (connection) {
        try {
          await connection.rollback();
          console.log("Transaction rolled back");
        } catch (rollbackErr) {
          console.error("Error during rollback:", rollbackErr);
        }
      }
      throw error;
    } finally {
      if (connection) {
        connection.release();
        console.log("Database connection released");
      }
    }

    console.log("Successfully updated content");
    return NextResponse.json({ 
      id,
      title,
      subject_area_id,
      tags,
      updated_at: new Date()
    });
  } catch (error: any) {
    console.error("Error updating H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update content" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve a single H5P content by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    console.log(`Fetching content with ID: ${id}`);

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
      console.log(`Content query completed, result length: ${(contentResult as any[]).length}`);
    } catch (err) {
      console.error("Database error fetching content:", err);
      return NextResponse.json(
        { error: "Database error when fetching content" },
        { status: 500 }
      );
    }

    if (!Array.isArray(contentResult) || contentResult.length === 0) {
      console.log("Content not found");
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
          ct.content_id = ?
        ORDER BY 
          t.name
      `, [id]);
      console.log(`Tags query completed, found ${(contentTags as any[]).length} tags`);
    } catch (err) {
      console.error("Database error fetching content tags:", err);
      // Continue even if tags query fails
      contentTags = [];
    }

    // Get all available tags for the dropdown
    let allTags;
    try {
      [allTags] = await pool.query(`
        SELECT id, name
        FROM tags
        ORDER BY name
      `);
    } catch (err) {
      console.error("Database error fetching all tags:", err);
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
      console.error("Database error fetching subject areas:", err);
      // Continue even if this query fails
      subjectAreas = [];
    }

    const contentData = (contentResult as any[])[0];
    
    // Check if contentData is valid before adding the tags property
    if (!contentData) {
      console.error("contentData is null or undefined");
      return NextResponse.json(
        { error: "Content data could not be processed" },
        { status: 500 }
      );
    }
    
    // Safely add tags to content data
    contentData.tags = contentTags || [];

    console.log("Successfully prepared content response");
    return NextResponse.json({
      content: contentData,
      allTags: allTags || [],
      subjectAreas: subjectAreas || []
    });
  } catch (error: any) {
    console.error("Error fetching H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch content" },
      { status: 500 }
    );
  }
}
