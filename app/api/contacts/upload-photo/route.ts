import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei ausgewählt' },
        { status: 400 }
      );
    }

    // Validierung der Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Datei ist zu groß. Maximum 5MB erlaubt.' },
        { status: 400 }
      );
    }

    // Validierung des Dateityps
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Ungültiger Dateityp. Nur JPEG, PNG und WebP sind erlaubt.' },
        { status: 400 }
      );
    }

    // Erstelle Upload-Verzeichnis falls es nicht existiert
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'contacts');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Verzeichnis existiert bereits
    }

    // Generiere eindeutigen Dateinamen
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `contact-${timestamp}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Konvertiere File zu Buffer und speichere
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Rückgabe der URL für die Datenbank
    const photoUrl = `/uploads/contacts/${fileName}`;

    return NextResponse.json({
      success: true,
      photoUrl,
      message: 'Foto erfolgreich hochgeladen'
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Fotos' },
      { status: 500 }
    );
  }
}
