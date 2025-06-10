import { NextRequest, NextResponse } from "next/server";
import { PageSettingsService } from "@/app/services/PageSettingsService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (!page || !['imprint', 'privacy', 'copyright'].includes(page)) {
      return NextResponse.json({ error: "Invalid page parameter" }, { status: 400 });
    }    const pageSettingsService = new PageSettingsService();
    const contentSetting = await pageSettingsService.findByKey(`legal_${page}`);

    return NextResponse.json({
      page,
      content: contentSetting?.value || '',
      title: page === 'imprint' ? 'Impressum' 
           : page === 'privacy' ? 'Datenschutz' 
           : 'Urheberrecht'
    });
  } catch (error) {
    console.error("Error fetching legal page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch legal page content" },
      { status: 500 }
    );
  }
}
