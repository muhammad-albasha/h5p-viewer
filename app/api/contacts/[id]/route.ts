import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/app/lib/datasource";
import { Contact } from "@/app/entities/Contact";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { id } = await params;
    const contactRepository = AppDataSource.getRepository(Contact);
    const contact = await contactRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const body = await request.json();
    const {
      name,
      position,
      department,
      email,
      phone,
      photo,
      bio,
      office,
      linkedin,
      displayOrder,
    } = body;
    if (!name || !department || !email) {
      return NextResponse.json(
        { error: "Name, department, and email are required" },
        { status: 400 }
      );
    }

    const { id } = await params;
    const contactRepository = AppDataSource.getRepository(Contact);
    const contact = await contactRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Update contact
    contact.name = name;
    contact.position = position;
    contact.department = department;
    contact.email = email;
    contact.phone = phone;
    contact.photo = photo || "/assets/placeholder-image.svg";
    contact.bio = bio;
    contact.office = office;
    contact.linkedin = linkedin;
    contact.displayOrder = displayOrder ?? contact.displayOrder;

    await contactRepository.save(contact);

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { id } = await params;
    const contactRepository = AppDataSource.getRepository(Contact);
    const contact = await contactRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Lösche das zugehörige Foto falls es ein Upload-Foto ist
    if (
      contact.photo &&
      contact.photo !== "/assets/placeholder-image.svg" &&
      contact.photo.startsWith("/uploads/contacts/")
    ) {
      try {
        const fileName = path.basename(contact.photo);
        const filePath = path.join(
          process.cwd(),
          "public",
          "uploads",
          "contacts",
          fileName
        );
        await unlink(filePath);
      } catch (photoError) {
        // Foto-Löschung fehlgeschlagen, aber Kontakt trotzdem löschen
        console.warn("Failed to delete contact photo:", photoError);
      }
    }

    await contactRepository.remove(contact);

    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
