import { NextRequest, NextResponse } from "next/server";
import { FeaturedContentService } from "@/app/services";

export async function GET(request: NextRequest) {
  try {
    const featuredService = new FeaturedContentService();

    // Get the last modification time of featured content
    const lastModified = await featuredService.getLastModified();
    const lastModifiedTime = lastModified ? lastModified.getTime() : 0;

    // Check if client sent If-None-Match header (ETag check)
    const clientETag = request.headers.get("If-None-Match");
    const currentETag = `"featured-${lastModifiedTime}"`;

    // If client has the latest version, return 304 Not Modified
    if (clientETag === currentETag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: currentETag,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Fetch featured H5P content from database
    const featuredContent = await featuredService.getFeaturedContent(3);
    const h5pContents = featuredContent.map((content) => ({
      id: content.id,
      name: content.title,
      path: `/h5p/content?id=${content.id}`,
      type: content.contentType || "Interactive Content",
      tags: content.tags?.map((tag) => tag.name) || [],
      slug: content.slug,
      coverImagePath: content.coverImagePath,
      description: content.description,
      subject_area: null, // This would need to be fetched separately now
      created_at: content.createdAt,
    }));

    // Return with ETag for caching optimization
    const response = NextResponse.json(h5pContents);
    response.headers.set("ETag", currentETag);
    response.headers.set("Cache-Control", "no-cache");
    response.headers.set(
      "Last-Modified",
      lastModified ? lastModified.toUTCString() : new Date().toUTCString()
    );

    return response;
  } catch (error) {
    // Database query failed - return empty array with no ETag
    console.error("Error fetching featured content:", error);
    const response = NextResponse.json([]);
    response.headers.set("Cache-Control", "no-cache");

    return response;
  }
}
