"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import PhotoUpload from "@/app/components/PhotoUpload";

interface Contact {
  id: number;
  name: string;
  position?: string;
  department: string;
  email: string;
  phone?: string;
  photo: string;
  bio?: string;
  office?: string;
  linkedin?: string;
  displayOrder: number;
}

export default function ContactsAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    photo: "/assets/placeholder-image.svg",
    bio: "",
    office: "",
    linkedin: "",
    displayOrder: 0,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/contacts");
        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setError("Fehler beim Laden der Kontakte");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchContacts();
    }
  }, [status]);
  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      photo: "/assets/placeholder-image.svg",
      bio: "",
      office: "",
      linkedin: "",
      displayOrder: 0,
    });
    setEditingContact(null);
    setShowAddForm(false);
  };
  const handleEdit = (contact: Contact) => {
    setFormData({
      name: contact.name,
      position: contact.position || "",
      department: contact.department,
      email: contact.email,
      phone: contact.phone || "",
      photo: contact.photo || "/assets/placeholder-image.svg",
      bio: contact.bio || "",
      office: contact.office || "",
      linkedin: contact.linkedin || "",
      displayOrder: contact.displayOrder,
    });
    setEditingContact(contact);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingContact
        ? `/api/contacts/${editingContact.id}`
        : "/api/contacts";

      const method = editingContact ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save contact");
      }

      const savedContact = await response.json();

      if (editingContact) {
        setContacts(
          contacts.map((c) => (c.id === editingContact.id ? savedContact : c))
        );
      } else {
        setContacts([...contacts, savedContact]);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Möchten Sie diesen Kontakt wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      setContacts(contacts.filter((c) => c.id !== id));
    } catch (err) {
      setError("Fehler beim Löschen");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Header />

      {/* Header */}
      <div className="bg-primary text-white relative overflow-hidden dark:bg-black">
        <div className="relative z-10 container-fluid mx-auto  px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Kontakte verwalten
              </h1>
              <p className="text-white/80 text-lg mt-2">
                Kontaktpersonen für die Kontakt-Seite verwalten
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Neuen Kontakt hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-fluid mx-auto  px-4">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingContact
                    ? "Kontakt bearbeiten"
                    : "Neuen Kontakt hinzufügen"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>{" "}
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Vor- und Nachname"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>{" "}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>{" "}
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      placeholder="z.B. Projektleiter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Abteilung *
                    </label>{" "}
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      placeholder="z.B. IT & Entwicklung"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-Mail *
                    </label>{" "}
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>{" "}
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+49 123 456 789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>{" "}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Büro
                    </label>{" "}
                    <input
                      type="text"
                      value={formData.office}
                      onChange={(e) =>
                        setFormData({ ...formData, office: e.target.value })
                      }
                      placeholder="z.B. Raum 301, Hauptgebäude"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reihenfolge
                    </label>{" "}
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayOrder: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Foto Upload Sektion */}
                <div className="mt-6">
                  <PhotoUpload
                    currentPhoto={formData.photo}
                    onPhotoChange={(photoUrl) =>
                      setFormData({ ...formData, photo: photoUrl })
                    }
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografie
                  </label>{" "}
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={3}
                    placeholder="Kurze Beschreibung der Person und ihrer Expertise..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingContact ? "Aktualisieren" : "Hinzufügen"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Contacts Grid */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Kontakte ({contacts.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">Keine Kontakte gefunden.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={contact.photo}
                          alt={contact.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>{" "}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {contact.name}
                        </h3>
                        {contact.position && (
                          <p className="text-sm text-blue-600">
                            {contact.position}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {contact.department}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>📧 {contact.email}</p>
                      {contact.phone && <p>📞 {contact.phone}</p>}
                      {contact.office && <p>🏢 {contact.office}</p>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
