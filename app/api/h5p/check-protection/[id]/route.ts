import { NextRequest, NextResponse } from 'next/server';
import { H5PContentService } from '@/app/services/H5PContentService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = parseInt(params.id);

    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: 'Ungültige Content ID' },
        { status: 400 }
      );
    }

    const h5pService = new H5PContentService();
    
    // Get content by ID
    const content = await h5pService.findById(contentId);
    
    if (!content) {
      return NextResponse.json(
        { error: 'Inhalt nicht gefunden' },
        { status: 404 }
      );
    }

    // Return only whether the content is password protected (not the password itself)
    const isPasswordProtected = !!(content.password && content.password.trim() !== '');
    
    return NextResponse.json({ 
      isPasswordProtected 
    });
  } catch (error) {
    console.error('Protection check error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
