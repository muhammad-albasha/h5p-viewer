import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { pool } from "@/app/lib/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Get subject area details
    const [rows] = await pool.query(
      'SELECT id, name, slug, created_at FROM subject_areas WHERE id = ?',
      [id]
    );

    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: "Subject area not found" }, { status: 404 });
    }    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    // Error fetching subject area details
    return NextResponse.json(
      { error: "Failed to fetch subject area details" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
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
        return { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }[match as 'ä' | 'ö' | 'ü' | 'ß'] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Update subject area
    await pool.query(
      'UPDATE subject_areas SET name = ?, slug = ? WHERE id = ?',
      [name, slug, id]
    );

    return NextResponse.json({ id, name, slug });  } catch (error: any) {
    // Error updating subject area
    
    // Check for duplicate entry
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: "A subject area with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update subject area" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Delete subject area
    await pool.query('DELETE FROM subject_areas WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {    // Error deleting subject area
    return NextResponse.json(
      { error: "Failed to delete subject area" },
      { status: 500 }
    );
  }
}
