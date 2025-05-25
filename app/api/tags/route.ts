import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

// GET /api/tags - Alle Tags abrufen
export async function GET() {
  try {
    // Rufe alle Tags aus der Datenbank ab
    const [rows] = await pool.query('SELECT * FROM tags ORDER BY name');
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Tags:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Tags' },
      { status: 500 }
    );
  }
}
