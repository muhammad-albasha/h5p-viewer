import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function GET() {
  try {
    // Fetch featured H5P content from database
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
        GROUP_CONCAT(t.name) as tags
      FROM h5p_content hc
      LEFT JOIN subject_areas sa ON hc.subject_area_id = sa.id
      LEFT JOIN content_tags ct ON hc.id = ct.content_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE hc.id IN (
        SELECT content_id FROM featured_content
        UNION
        SELECT id FROM h5p_content ORDER BY created_at DESC LIMIT 3
      )
      GROUP BY hc.id, hc.title, hc.slug, hc.file_path, hc.content_type, hc.created_at, sa.name, sa.slug
      ORDER BY hc.created_at DESC
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

    return NextResponse.json(h5pContents);
  } catch (error) {
    // Return fallback data if database query fails
    return NextResponse.json([
      {
        id: 1,
        name: "For or Since",
        path: "/h5p/content?id=1",
        type: "Quiz",
        tags: ["Grammatik", "Übungen"],
        slug: "for-or-since"
      },
      {
        id: 2,
        name: "Test Questionnaire",
        path: "/h5p/content?id=2",
        type: "Questionnaire",
        tags: ["Fragen", "Interaktiv"],
        slug: "test-questionnaire"
      },
      {
        id: 3,
        name: "Interactive Exercise",
        path: "/h5p/content?id=3",
        type: "Exercise",
        tags: ["Interaktiv", "Lernen"],
        slug: "interactive-exercise"
      }
    ]);
  }
}
