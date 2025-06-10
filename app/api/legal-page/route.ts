import { NextRequest, NextResponse } from "next/server";
import { PageSettingsService } from "@/app/services/PageSettingsService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || searchParams.get('page');

    if (!type || !['imprint', 'privacy', 'copyright', 'easy_language', 'about_us'].includes(type)) {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    const pageSettingsService = new PageSettingsService();
    let contentSetting;
    
    // Handle different key formats
    if (type === 'easy_language' || type === 'about_us') {
      contentSetting = await pageSettingsService.findByKey(type);
    } else {
      contentSetting = await pageSettingsService.findByKey(`legal_${type}`);
    }

    return NextResponse.json({
      type,
      content: contentSetting?.value || '',
      title: type === 'imprint' ? 'Impressum' 
           : type === 'privacy' ? 'Datenschutz' 
           : type === 'copyright' ? 'Urheberrecht'
           : type === 'easy_language' ? 'Leichte Sprache'
           : 'Über uns'
    });
  } catch (error) {
    console.error("Error fetching legal page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch legal page content" },
      { status: 500 }
    );
  }
}
