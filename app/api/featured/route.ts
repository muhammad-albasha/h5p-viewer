import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    // First, get the last modification time of featured content
    const [lastModRows] = await pool.query(`
      SELECT MAX(fc.created_at) as last_modified
      FROM featured_content fc
    `);
    
    const lastModified = (lastModRows as any[])[0]?.last_modified;
    const lastModifiedTime = lastModified ? new Date(lastModified).getTime() : 0;
    
    // Check if client sent If-None-Match header (ETag check)
    const clientETag = request.headers.get('If-None-Match');
    const currentETag = `"featured-${lastModifiedTime}"`;
    
    // If client has the latest version, return 304 Not Modified
    if (clientETag === currentETag) {
      return new NextResponse(null, { 
        status: 304,
        headers: {
          'ETag': currentETag,
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Fetch ONLY actual featured H5P content from database
    const [rows] = await pool.query(`
      SELECT 
        hc.id,
        hc.title as name,
        hc.slug,
        hc.file_path as path,
        hc.content_type as type,
        hc.created_at,
        sa.name as subject_area_name,
        sa.slug as subject_area_slug,
        GROUP_CONCAT(t.name) as tags,
        fc.created_at as featured_at
      FROM h5p_content hc
      INNER JOIN featured_content fc ON hc.id = fc.content_id
      LEFT JOIN subject_areas sa ON hc.subject_area_id = sa.id
      LEFT JOIN content_tags ct ON hc.id = ct.content_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      GROUP BY hc.id, hc.title, hc.slug, hc.file_path, hc.content_type, hc.created_at, sa.name, sa.slug, fc.created_at
      ORDER BY fc.created_at DESC
      LIMIT 3
    `);

    const h5pContents = (rows as any[]).map((row: any) => ({
      id: row.id,
      name: row.name,
      path: `/h5p/content?id=${row.id}`,
      type: row.type || 'Interactive Content',
      tags: row.tags ? row.tags.split(',') : [],
      slug: row.slug,
      subject_area: row.subject_area_name ? {
        name: row.subject_area_name,
        slug: row.subject_area_slug
      } : null,
      created_at: row.created_at
    }));

    // Return with ETag for caching optimization
    const response = NextResponse.json(h5pContents);
    response.headers.set('ETag', currentETag);
    response.headers.set('Cache-Control', 'no-cache');
    response.headers.set('Last-Modified', lastModified ? new Date(lastModified).toUTCString() : new Date().toUTCString());
      return response;
  } catch (error) {
    // Database query failed - return empty array with no ETag
    const response = NextResponse.json([]);
    response.headers.set('Cache-Control', 'no-cache');
    
    return response;
  }
}
