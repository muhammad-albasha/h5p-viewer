import { NextRequest, NextResponse } from 'next/server';
import { H5PContentService } from '@/app/services/H5PContentService';

export async function POST(request: NextRequest) {
  try {
    const { contentId, password } = await request.json();

    if (!contentId || !password) {
      return NextResponse.json(
        { error: 'Content ID und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    const h5pService = new H5PContentService();
      // Get content by ID
    const content = await h5pService.findById(parseInt(contentId));
    
    if (!content) {
      return NextResponse.json(
        { error: 'Inhalt nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if content is password protected
    if (!content.password || content.password.trim() === '') {
      return NextResponse.json({ success: true });
    }

    // Verify password (in production, you might want to hash passwords)
    if (content.password === password) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Falsches Passwort' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
