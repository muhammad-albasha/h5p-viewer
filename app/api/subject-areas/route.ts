import { NextResponse } from "next/server";
import { SubjectAreaService } from "@/app/services";

export async function GET() {
  try {
    // No authentication required for public subject areas endpoint
    const subjectAreaService = new SubjectAreaService();
    const subjectAreas = await subjectAreaService.findAll();

    return NextResponse.json(subjectAreas);
  } catch (error) {
    console.error("Error fetching subject areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject areas" },
      { status: 500 }
    );
  }
}
