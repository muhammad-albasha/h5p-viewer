import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { SubjectAreaService } from "@/app/services";

export async function GET(
  request: Request,
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
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Get subject area details
    const subjectAreaService = new SubjectAreaService();
    const subjectArea = await subjectAreaService.findById(id);

    if (!subjectArea) {
      return NextResponse.json(
        { error: "Subject area not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subjectArea);
  } catch (error) {
    // Error fetching subject area details
    console.error("Error fetching subject area details:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject area details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    } // Parse request body
    const { name, color } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Subject area name is required" },
        { status: 400 }
      );
    }

    // Update subject area
    const subjectAreaService = new SubjectAreaService();
    const updatedSubjectArea = await subjectAreaService.update(
      id,
      name.trim(),
      color || undefined
    );

    if (!updatedSubjectArea) {
      return NextResponse.json(
        { error: "Subject area not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSubjectArea);
  } catch (error: any) {
    // Error updating subject area
    console.error("Error updating subject area:", error);

    // Check for duplicate entry
    if (error.message.includes("already exists")) {
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

export async function DELETE(
  request: Request,
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
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Delete subject area
    const subjectAreaService = new SubjectAreaService();
    const deleted = await subjectAreaService.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Subject area not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Error deleting subject area
    console.error("Error deleting subject area:", error);
    return NextResponse.json(
      { error: "Failed to delete subject area" },
      { status: 500 }
    );
  }
}
