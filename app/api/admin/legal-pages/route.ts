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
      // Fetch all legal page settings
    const imprint = await pageSettingsService.findByKey('legal_imprint');
    const privacy = await pageSettingsService.findByKey('legal_privacy');
    const copyright = await pageSettingsService.findByKey('legal_copyright');

    return NextResponse.json({
      imprint: imprint?.value || '',
      privacy: privacy?.value || '',
      copyright: copyright?.value || ''
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
    const { imprint, privacy, copyright } = body;

    const pageSettingsService = new PageSettingsService();
      // Update all legal page settings
    if (imprint !== undefined) {
      await pageSettingsService.upsert('legal_imprint', imprint, 'Impressum Seiteninhalt');
    }
    
    if (privacy !== undefined) {
      await pageSettingsService.upsert('legal_privacy', privacy, 'Datenschutz Seiteninhalt');
    }
    
    if (copyright !== undefined) {
      await pageSettingsService.upsert('legal_copyright', copyright, 'Urheberrecht Seiteninhalt');
    }

    return NextResponse.json({ 
      message: "Legal page settings updated successfully",
      imprint,
      privacy,
      copyright
    });
  } catch (error) {
    console.error("Error updating legal page settings:", error);
    return NextResponse.json(
      { error: "Failed to update legal page settings" },
      { status: 500 }
    );
  }
}
