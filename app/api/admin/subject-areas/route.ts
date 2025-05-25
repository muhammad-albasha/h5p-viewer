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

    // Get subject areas list from database
    const [rows] = await pool.query(`
      SELECT id, name, slug, created_at
      FROM subject_areas
      ORDER BY name ASC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching subject areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject areas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { name } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Subject area name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[äöüß]/g, (match: string) => {
        const replacements: Record<string, string> = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
        return replacements[match as keyof typeof replacements] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Insert new subject area
    const [result] = await pool.query(
      'INSERT INTO subject_areas (name, slug) VALUES (?, ?)',
      [name, slug]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      name,
      slug,
      created_at: new Date(),
    });
  } catch (error: any) {
    console.error("Error creating subject area:", error);
    
    // Check for duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: "A subject area with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create subject area" },
      { status: 500 }
    );
  }
}
