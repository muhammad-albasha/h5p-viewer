import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { SubjectAreaService } from "@/app/services";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get subject areas list from database
    const subjectAreaService = new SubjectAreaService();
    const subjectAreas = await subjectAreaService.findAll();
    
    return NextResponse.json(subjectAreas);
  } catch (error) {
    // Error fetching subject areas
    console.error('Error fetching admin subject areas:', error);
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
    }    // Parse request body
    const { name, color } = await request.json();
    
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Subject area name is required" },
        { status: 400 }
      );
    }

    // Create new subject area
    const subjectAreaService = new SubjectAreaService();
    const newSubjectArea = await subjectAreaService.create(name.trim(), color || undefined);
    
    return NextResponse.json(newSubjectArea);
  } catch (error: any) {
    // Error creating subject area
    console.error('Error creating subject area:', error);
    
    // Check for duplicate entry
    if (error.message.includes('already exists')) {
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
