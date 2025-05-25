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

    // Get tags list from database
    const [rows] = await pool.query(`
      SELECT id, name, created_at
      FROM tags
      ORDER BY name ASC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
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
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    // Insert new tag
    const [result] = await pool.query(
      'INSERT INTO tags (name) VALUES (?)',
      [name]
    );

    return NextResponse.json({
      id: (result as any).insertId,
      name,
      created_at: new Date(),
    });
  } catch (error: any) {
    console.error("Error creating tag:", error);
    
    // Check for duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: "A tag with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
