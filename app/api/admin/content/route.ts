import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { H5PContentService } from "@/app/services";

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }    // Get content list from database with relationships
    const h5pContentService = new H5PContentService();
    const contentItems = await h5pContentService.findAll();    // Format response to match existing API
    const formattedItems = contentItems.map(content => ({
      id: content.id,
      title: content.title,
      slug: content.slug,
      content_type: content.contentType,
      created_at: content.createdAt,
      subject_area_id: content.subjectAreaId || null,
      subject_area_name: content.subjectArea?.name || null,
      subject_area_slug: content.subjectArea?.slug || null,
      tags: content.tags?.map(tag => ({
        id: tag.id,
        name: tag.name
      })) || []
    }));

    return NextResponse.json(formattedItems);
  } catch (error) {
    // Error fetching H5P content
    console.error('Error fetching admin content:', error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}
