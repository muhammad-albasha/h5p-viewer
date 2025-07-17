import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/app/lib/datasource";
import { Contact } from "@/app/entities/Contact";
import { withBasePath } from "@/app/utils/paths";

export async function GET() {
  try {
    console.log("[Contacts API] Processing GET request");
    
    if (!AppDataSource.isInitialized) {
      try {
        console.log("[Contacts API] Initializing database connection");
        await AppDataSource.initialize();
        console.log("[Contacts API] Database initialized successfully");
      } catch (dbInitError) {
        console.error("[Contacts API] Failed to initialize database:", dbInitError);
        throw dbInitError;
      }
    }

    console.log("[Contacts API] Querying contacts");
    const contactRepository = AppDataSource.getRepository(Contact);
    const contacts = await contactRepository.find({
      order: {
        displayOrder: "ASC",
        id: "ASC",
      },
    });

    console.log(`[Contacts API] Found ${contacts.length} contacts`);

    // Normalize photo URLs to include basePath if needed
    const normalizedContacts = contacts.map(contact => ({
      ...contact,
      photo: contact.photo.startsWith('/h5p-viewer/') 
        ? contact.photo 
        : contact.photo.startsWith('/') 
          ? withBasePath(contact.photo)
          : contact.photo
    }));

    console.log("[Contacts API] Returning normalized contacts");
    return NextResponse.json(normalizedContacts);
  } catch (error) {
    console.error("[Contacts API] Error fetching contacts:", error);
    
    // Include more details about the error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to fetch contacts: ${error instanceof Error ? error.message : 'Unknown error'}`
      : "Failed to fetch contacts";
      
    return NextResponse.json(
      { error: errorMessage, stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined },
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