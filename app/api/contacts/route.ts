import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/app/lib/datasource";
import { Contact } from "@/app/entities/Contact";
import { withBasePath } from "@/app/utils/paths";
import fs from 'fs';
import path from 'path';

// Helper function to check if image exists
function imageExists(imagePath: string): boolean {
  try {
    // Remove basePath and leading slash for local file check
    const cleanPath = imagePath.replace('/h5p-viewer', '').replace(/^\//, '');
    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    return fs.existsSync(fullPath);
  } catch (error) {
    console.error('Error checking image existence:', error);
    return false;
  }
}

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

    // Normalize photo URLs and check if images exist
    const normalizedContacts = contacts.map(contact => {
      let photo = contact.photo;
      
      // Normalize photo URL to include basePath if needed
      if (!photo.startsWith('/h5p-viewer/') && photo.startsWith('/')) {
        photo = withBasePath(photo);
      }
      
      // Check if image exists, if not use placeholder
      if (!imageExists(photo)) {
        console.warn(`Contact image not found: ${photo}, using placeholder for contact ${contact.id}`);
        photo = withBasePath("/assets/placeholder-image.svg");
      }
      
      return {
        ...contact,
        photo
      };
    });

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
