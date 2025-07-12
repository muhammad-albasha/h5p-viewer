import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { PageSettingsService } from "../../../services/PageSettingsService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pageSettingsService = new PageSettingsService();
    const heroSettings = await pageSettingsService.getHeroSettings();

    return NextResponse.json(heroSettings);
  } catch (error) {
    console.error("Error fetching page settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, subtitle, description } = body;

    if (!title || !subtitle || !description) {
      return NextResponse.json(
        { error: "Title, subtitle, and description are required" },
        { status: 400 }
      );
    }

    const pageSettingsService = new PageSettingsService();
    await pageSettingsService.updateHeroSettings({
      title,
      subtitle,
      description,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating page settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
