import { NextResponse } from "next/server";
import { TagService } from "@/app/services";

// GET /api/tags - Alle Tags abrufen
export async function GET() {
  try {
    const tagService = new TagService();
    const tags = await tagService.findAll();

    return NextResponse.json(tags);
  } catch (error: any) {
    // Error fetching tags
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Tags" },
      { status: 500 }
    );
  }
}
