import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoUrl = searchParams.get("photoUrl");

    if (!photoUrl) {
      return NextResponse.json(
        { error: "Keine Foto-URL angegeben" },
        { status: 400 }
      );
    }

    // Nur eigene Upload-Fotos löschen, nicht Placeholder
    if (
      photoUrl === "/assets/placeholder-image.svg" ||
      !photoUrl.startsWith("/uploads/contacts/")
    ) {
      return NextResponse.json(
        { error: "Foto kann nicht gelöscht werden" },
        { status: 400 }
      );
    }

    // Dateipfad erstellen
    const fileName = path.basename(photoUrl);
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "contacts",
      fileName
    );

    try {
      await unlink(filePath);
      return NextResponse.json({
        success: true,
        message: "Foto erfolgreich gelöscht",
      });
    } catch (error) {
      // Datei existiert möglicherweise nicht mehr
      console.warn("File not found for deletion:", filePath);
      return NextResponse.json({
        success: true,
        message: "Foto war bereits gelöscht",
      });
    }
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Fotos" },
      { status: 500 }
    );
  }
}
