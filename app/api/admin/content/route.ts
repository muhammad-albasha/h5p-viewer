import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get content list from database with subject area info
    const [rows] = await pool.query(`
      SELECT 
        h.id, 
        h.title, 
        h.slug, 
        h.content_type, 
        h.created_at,
        h.subject_area_id,
        sa.name as subject_area_name,
        sa.slug as subject_area_slug
      FROM 
        h5p_content h
      LEFT JOIN 
        subject_areas sa ON h.subject_area_id = sa.id
      ORDER BY 
        h.created_at DESC
    `);

    // For each content item, get its tags
    const contentItems = await Promise.all((rows as any[]).map(async (content) => {
      const [tags] = await pool.query(`
        SELECT t.id, t.name
        FROM tags t
        JOIN content_tags ct ON t.id = ct.tag_id
        WHERE ct.content_id = ?
      `, [content.id]);
      
      return {
        ...content,
        tags: tags
      };
    }));    return NextResponse.json(contentItems);
  } catch (error) {
    // Error fetching H5P content
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
