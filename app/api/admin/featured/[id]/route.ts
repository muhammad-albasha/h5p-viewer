import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { pool } from '@/app/lib/db';

// Toggle featured status for H5P content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const contentId = parseInt(resolvedParams.id);
    if (isNaN(contentId)) {
      return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
    }

    // Check if content exists
    const [contentRows] = await pool.query(
      'SELECT id, title FROM h5p_content WHERE id = ?',
      [contentId]
    );

    if (!Array.isArray(contentRows) || contentRows.length === 0) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if already featured
    const [featuredRows] = await pool.query(
      'SELECT id FROM featured_content WHERE content_id = ?',
      [contentId]
    );

    const isFeatured = Array.isArray(featuredRows) && featuredRows.length > 0;

    if (isFeatured) {
      // Remove from featured
      await pool.query(
        'DELETE FROM featured_content WHERE content_id = ?',
        [contentId]
      );
      
      return NextResponse.json({ 
        success: true, 
        featured: false,
        message: 'Aus Featured entfernt'
      });
    } else {
      // Check if we already have 3 featured items
      const [countRows] = await pool.query(
        'SELECT COUNT(*) as count FROM featured_content'
      );
      
      const featuredCount = Array.isArray(countRows) && countRows.length > 0 
        ? (countRows[0] as any).count 
        : 0;

      if (featuredCount >= 3) {
        return NextResponse.json({ 
          error: 'Maximal 3 Featured-Inhalte möglich. Bitte entfernen Sie erst einen anderen.' 
        }, { status: 400 });
      }

      // Add to featured
      await pool.query(
        'INSERT INTO featured_content (content_id, created_at) VALUES (?, NOW())',
        [contentId]
      );
      
      return NextResponse.json({ 
        success: true, 
        featured: true,
        message: 'Als Featured markiert'
      });
    }

  } catch (error) {
    return NextResponse.json({ 
      error: 'Datenbankfehler' 
    }, { status: 500 });
  }
}

// Get featured status for content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const contentId = parseInt(resolvedParams.id);
    if (isNaN(contentId)) {
      return NextResponse.json({ error: 'Invalid content ID' }, { status: 400 });
    }

    const [featuredRows] = await pool.query(
      'SELECT id FROM featured_content WHERE content_id = ?',
      [contentId]
    );

    const isFeatured = Array.isArray(featuredRows) && featuredRows.length > 0;

    return NextResponse.json({ featured: isFeatured });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Datenbankfehler' 
    }, { status: 500 });
  }
}
