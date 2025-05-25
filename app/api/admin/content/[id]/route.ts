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

    // Get content info before deletion
    const [content] = await pool.query(
      "SELECT file_path FROM h5p_content WHERE id = ?",
      [id]
    );

    if (Array.isArray(content) && content.length === 0) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Delete the file
    const filePath = (content as any[])[0].file_path;
    const fullPath = path.join(process.cwd(), "public", filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Delete from database
    await pool.query("DELETE FROM h5p_content WHERE id = ?", [id]);

    return NextResponse.json({ message: "Content deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting H5P content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete content" },
      { status: 500 }
    );
  }
}
