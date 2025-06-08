import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { TagService } from "@/app/services";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get tags list from database
    const tagService = new TagService();
    const tags = await tagService.findAll();
    
    return NextResponse.json(tags);
  } catch (error) {
    // Error fetching tags
    console.error('Error fetching admin tags:', error);
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

    // Create new tag
    const tagService = new TagService();
    const newTag = await tagService.create(name.trim());
    
    return NextResponse.json(newTag);
  } catch (error: any) {
    // Error creating tag
    console.error('Error creating tag:', error);
    
    // Check for duplicate entry
    if (error.message.includes('already exists')) {
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
