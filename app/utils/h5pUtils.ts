import fs from 'fs';
import path from 'path';
import { pool } from '@/app/lib/db';

interface H5PContent {
  id: number;
  name: string;
  path: string;
  type: string;
  tags: string[];
  slug?: string;
  created_at?: string;
  subject_area?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

// This function determines the content type based on library files
const determineH5PType = (contentPath: string): string => {
  try {
    // Try to read the h5p.json file
    const h5pJsonPath = path.join(contentPath, 'h5p.json');
    if (fs.existsSync(h5pJsonPath)) {
      const h5pJson = JSON.parse(fs.readFileSync(h5pJsonPath, 'utf-8'));
      return h5pJson.mainLibrary || 'Unknown';
    }
    
    // If no h5p.json, check for library directories
    const dirs = fs.readdirSync(contentPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
      
    // Look for common H5P libraries that indicate the type
    if (dirs.some(dir => dir.includes('MultiChoice'))) return 'Quiz';
    if (dirs.some(dir => dir.includes('Questionnaire'))) return 'Questionnaire';
    if (dirs.some(dir => dir.includes('InteractiveVideo'))) return 'Interactive Video';
    if (dirs.some(dir => dir.includes('Course'))) return 'Course Presentation';    
    return 'Unknown';
  } catch (error) {
    // Error determining H5P type - return default
    return 'Unknown';
  }
};

// Assign tags based on content type or other characteristics
const assignTags = (type: string, name: string): string[] => {
  const tags = [];
  
  // Tag based on type
  if (type === 'Quiz') tags.push('Übungen', 'Fragen');
  if (type === 'Questionnaire') tags.push('Fragen', 'Interaktiv');
  if (type === 'Interactive Video') tags.push('Video', 'Interaktiv');
  if (type === 'Course Presentation') tags.push('Präsentation', 'Interaktiv');
  
  // Tag based on name
  if (name.toLowerCase().includes('grammar') || name.toLowerCase().includes('grammatik')) tags.push('Grammatik');
  if (name.toLowerCase().includes('vocabulary') || name.toLowerCase().includes('vokabeln')) tags.push('Wortschatz');
  if (name.toLowerCase().includes('for-or-since')) tags.push('Grammatik');
  
  return [...new Set(tags)]; // Remove duplicates
};

export async function getH5PContents(): Promise<H5PContent[]> {
  try {
    // Get content from database with subject area information
    const [rows] = await pool.query(`
      SELECT 
        h.id, 
        h.title as name, 
        h.slug, 
        h.file_path as path, 
        h.content_type as type, 
        h.created_at,
        h.subject_area_id,
        sa.name as subject_area_name,
        sa.slug as subject_area_slug
      FROM 
        h5p_content h
      LEFT JOIN 
        subject_areas sa ON h.subject_area_id = sa.id
      ORDER BY 
        h.created_at DESC
    `);
    
    // If we have content in the database, use that with tags
    if (Array.isArray(rows) && rows.length > 0) {
      // For each content item, get its tags
      const contentsWithTags = await Promise.all((rows as any[]).map(async (row) => {
        // Get tags from database
        const [tagsRows] = await pool.query(`
          SELECT t.id, t.name
          FROM tags t
          JOIN content_tags ct ON t.id = ct.tag_id
          WHERE ct.content_id = ?
        `, [row.id]);
        
        // Extract tag names
        const tagNames = (tagsRows as any[]).map(tag => tag.name);
        
        // If no tags are found in the database, use the automatically assigned tags
        const tags = tagNames.length > 0 ? tagNames : assignTags(row.type || 'Unknown', row.name);
        
        return {
          id: row.id,
          name: row.name,
          path: row.path,
          type: row.type || 'Unknown',
          tags: tags,
          slug: row.slug,
          created_at: row.created_at,
          subject_area: row.subject_area_name ? {
            id: row.subject_area_id,
            name: row.subject_area_name,
            slug: row.subject_area_slug
          } : null
        };
      }));
      
      return contentsWithTags;
    }

    // If no database content, fall back to file system
    const h5pDir = path.join(process.cwd(), 'public', 'h5p');
      // Check if directory exists
    if (!fs.existsSync(h5pDir)) {
      // H5P directory not found - return empty array
      return [];
    }
    
    // Get subdirectories (each is an H5P content)
    const contentDirs = fs.readdirSync(h5pDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    const contents: H5PContent[] = contentDirs.map((dir, index) => {
      // Format name from directory (replace hyphens with spaces and capitalize)
      const name = dir
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      
      const contentPath = path.join(h5pDir, dir);
      const type = determineH5PType(contentPath);
      const tags = assignTags(type, name);
        return {
        id: index + 1,
        name,
        path: `/h5p/${dir}`,
        type,
        tags,
        slug: dir,
        created_at: new Date().toISOString(),
        subject_area: null
      };
    });    
    return contents;
  } catch (error) {
    // Error retrieving H5P contents - return empty array
    return [];
  }
}
