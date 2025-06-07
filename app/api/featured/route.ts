import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function GET() {
  try {
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
    }));    // Return with no-cache headers to ensure fresh data
    const response = NextResponse.json(h5pContents);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    // Database query failed - return empty array with no fallback content
    const response = NextResponse.json([]);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
}
