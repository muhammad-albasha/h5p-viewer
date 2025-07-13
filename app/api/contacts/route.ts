import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/app/lib/datasource";
import { Contact } from "@/app/entities/Contact";
import { withBasePath } from "@/app/utils/paths";

export async function GET() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const contactRepository = AppDataSource.getRepository(Contact);
    const contacts = await contactRepository.find({
      order: {
        displayOrder: "ASC",
        id: "ASC",
      },
    });

    // Normalize photo URLs to include basePath if needed
    const normalizedContacts = contacts.map(contact => ({
      ...contact,
      photo: contact.photo.startsWith('/h5p-viewer/') 
        ? contact.photo 
        : contact.photo.startsWith('/') 
          ? withBasePath(contact.photo)
          : contact.photo
    }));

    return NextResponse.json(normalizedContacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const contactRepository = AppDataSource.getRepository(Contact);

    const contact = contactRepository.create({
      name,
      position,
      department,
      email,
      phone,
      photo: photo || withBasePath("/assets/placeholder-image.svg"),
      bio,
      office,
      linkedin,
      displayOrder: displayOrder || 0,
    });

    await contactRepository.save(contact);

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
