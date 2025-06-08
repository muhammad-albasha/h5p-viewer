import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { FeaturedContentService, H5PContentService } from '@/app/services';

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

    const h5pContentService = new H5PContentService();
    const featuredService = new FeaturedContentService();

    // Check if content exists
    const content = await h5pContentService.findById(contentId);
    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if already featured
    const isFeatured = await featuredService.isFeatured(contentId);

    if (isFeatured) {
      // Remove from featured
      await featuredService.removeFromFeatured(contentId);
      
      return NextResponse.json({ 
        success: true, 
        featured: false,
        message: 'Aus Featured entfernt'
      });
    } else {
      // Check if we already have 3 featured items
      const featuredContent = await featuredService.getFeaturedContent(3);

      if (featuredContent.length >= 3) {
        return NextResponse.json({ 
          error: 'Maximal 3 Featured-Inhalte möglich. Bitte entfernen Sie erst einen anderen.' 
        }, { status: 400 });
      }

      // Add to featured
      await featuredService.addToFeatured(contentId);
      
      return NextResponse.json({ 
        success: true, 
        featured: true,
        message: 'Als Featured markiert'
      });
    }

  } catch (error) {
    console.error('Error toggling featured status:', error);
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

    const featuredService = new FeaturedContentService();
    const isFeatured = await featuredService.isFeatured(contentId);

    return NextResponse.json({ featured: isFeatured });

  } catch (error) {
    console.error('Error checking featured status:', error);
    return NextResponse.json({ 
      error: 'Datenbankfehler' 
    }, { status: 500 });
  }
}
