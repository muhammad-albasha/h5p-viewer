import { NextResponse } from "next/server";
import { SubjectAreaService } from "@/app/services";

// GET /api/subject-areas - Get all subject areas
export async function GET() {
  try {
    const subjectAreaService = new SubjectAreaService();
    const subjectAreas = await subjectAreaService.findAll();

    return NextResponse.json(subjectAreas);
  } catch (error: any) {
    // Error fetching subject areas
    console.error("Error fetching subject areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject areas" },
      { status: 500 }
    );
  }
}