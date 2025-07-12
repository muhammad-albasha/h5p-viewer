import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/auth";
import { PageSettingsService } from "@/app/services/PageSettingsService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const pageSettingsService = new PageSettingsService();
    // Fetch all page settings
    const imprint = await pageSettingsService.findByKey("legal_imprint");
    const privacy = await pageSettingsService.findByKey("legal_privacy");
    const copyright = await pageSettingsService.findByKey("legal_copyright");
    const easyLanguage = await pageSettingsService.findByKey("easy_language");
    const about = await pageSettingsService.findByKey("about_us");

    return NextResponse.json({
      imprint: imprint?.value || "",
      privacy: privacy?.value || "",
      copyright: copyright?.value || "",
      easyLanguage: easyLanguage?.value || "",
      about: about?.value || "",
    });
  } catch (error) {
    console.error("Error fetching legal page settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch legal page settings" },
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
    const { imprint, privacy, copyright, easyLanguage, about } = body;

    const pageSettingsService = new PageSettingsService();
    // Update all page settings
    if (imprint !== undefined) {
      await pageSettingsService.upsert(
        "legal_imprint",
        imprint,
        "Impressum Seiteninhalt"
      );
    }

    if (privacy !== undefined) {
      await pageSettingsService.upsert(
        "legal_privacy",
        privacy,
        "Datenschutz Seiteninhalt"
      );
    }

    if (copyright !== undefined) {
      await pageSettingsService.upsert(
        "legal_copyright",
        copyright,
        "Urheberrecht Seiteninhalt"
      );
    }

    if (easyLanguage !== undefined) {
      await pageSettingsService.upsert(
        "easy_language",
        easyLanguage,
        "Leichte Sprache Seiteninhalt"
      );
    }
    if (about !== undefined) {
      await pageSettingsService.upsert(
        "about_us",
        about,
        "Über uns Seiteninhalt"
      );
    }

    return NextResponse.json({
      message: "Page settings updated successfully",
      imprint,
      privacy,
      copyright,
      easyLanguage,
      about,
    });
  } catch (error) {
    console.error("Error updating legal page settings:", error);
    return NextResponse.json(
      { error: "Failed to update legal page settings" },
      { status: 500 }
    );
  }
}
