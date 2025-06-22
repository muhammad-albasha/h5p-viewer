import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';

interface Contact {
  id: number;
  name: string;
  position?: string;
  department: string;
  email: string;
  phone?: string;
  photo: string;
  bio?: string;
  linkedin?: string;
  office?: string;
}

async function getContacts(): Promise<Contact[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/contacts`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      console.error('Failed to fetch contacts');
      return getDefaultContacts();
    }
    
    const contacts = await response.json();
    return contacts.length > 0 ? contacts : getDefaultContacts();
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return getDefaultContacts();
  }
}

function getDefaultContacts(): Contact[] {
  return [
    {
      id: 1,
      name: "Dr. Sarah Weber",
      position: "Projektleitung",
      department: "Digitale Bildung",
      email: "sarah.weber@h5p-viewer.de",
      phone: "+49 123 456 789",
      photo: "/assets/placeholder-image.svg",
      bio: "Expertin für digitale Lernplattformen mit über 10 Jahren Erfahrung in der Bildungstechnologie.",
      office: "Raum 301, Hauptgebäude"
    },
    {
      id: 2,
      name: "Mark Schmidt",
      position: "Technischer Leiter",
      department: "IT & Entwicklung",
      email: "mark.schmidt@h5p-viewer.de",
      phone: "+49 123 456 790",
      photo: "/assets/placeholder-image.svg",
      bio: "Fullstack-Entwickler spezialisiert auf moderne Web-Technologien und interaktive Lerninhalte.",
      office: "Raum 205, IT-Zentrum"
    },
    {
      id: 3,
      name: "Anna Müller",
      position: "Content Manager",
      department: "Didaktik & Design",
      email: "anna.mueller@h5p-viewer.de",
      phone: "+49 123 456 791",
      photo: "/assets/placeholder-image.svg",
      bio: "Spezialistin für didaktisches Design und Erstellung interaktiver Lerninhalte.",
      office: "Raum 150, Kreativbereich"
    }
  ];
}

export default async function ContactPage() {
  const contacts = await getContacts();

  return (
    <>
      <Navbar />
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 container-fluid mx-auto  px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Kontakt
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Haben Sie Fragen zu unserer H5P-Plattform? Unser Team steht Ihnen gerne zur Verfügung!
            </p>
          </div>
        </div>
      </div>
      
      {/* Contact Cards Section */}
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container-fluid mx-auto  px-4">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Unser Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Lernen Sie die Menschen hinter der H5P-Viewer Plattform kennen. 
              Wir sind hier, um Ihnen bei allen Fragen zu helfen.
            </p>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-16">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Photo Section */}
                <div className="relative h-64 bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 flex items-center justify-center h-full">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-xl">
                      <Image
                        src={contact.photo}
                        alt={contact.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{contact.name}</h3>
                    {contact.position && (
                      <p className="text-blue-600 font-semibold">{contact.position}</p>
                    )}
                    <p className="text-gray-500 text-sm">{contact.department}</p>
                  </div>

                  {contact.bio && (
                    <p className="text-gray-600 text-sm mb-4 text-center">{contact.bio}</p>
                  )}

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <a href={`mailto:${contact.email}`} className="text-gray-700 hover:text-blue-600 transition-colors text-sm">
                        {contact.email}
                      </a>
                    </div>

                    {contact.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                        </div>
                        <a href={`tel:${contact.phone}`} className="text-gray-700 hover:text-green-600 transition-colors text-sm">
                          {contact.phone}
                        </a>
                      </div>
                    )}

                    {contact.office && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm">{contact.office}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
