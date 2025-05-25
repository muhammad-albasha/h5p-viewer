"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import TestExtraction from "@/app/components/admin/TestExtraction";

interface H5PContent {
  id: number;
  title: string;
  slug: string;
  content_type: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<H5PContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  
  // Fetch H5P contents when component loads
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/content");
        
        if (!response.ok) {
          throw new Error("Failed to fetch content");
        }
        
        const data = await response.json();
        setContents(data);
      } catch (err) {
        setError("Fehler beim Laden der Inhalte");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchContents();
    }
  }, [status]);

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
      
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-primary-content/80 mt-2">
                Verwalten Sie Ihre H5P Inhalte
              </p>
            </div>
            <Link 
              href="/admin/upload" 
              className="btn btn-accent hover:btn-accent-focus"
            >
              Neuen H5P-Inhalt hochladen
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-base-300">
              <h2 className="text-xl font-bold">H5P Inhalte</h2>
              <p className="text-sm opacity-70">
                Alle hochgeladenen interaktiven Lerninhalte
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="loading loading-spinner loading-md"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-error">
                <p>{error}</p>
              </div>
            ) : contents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="mb-4">Keine H5P Inhalte gefunden</p>
                <Link href="/admin/upload" className="btn btn-primary">
                  Ersten Inhalt hochladen
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Titel</th>
                      <th>Typ</th>
                      <th>Erstellt am</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contents.map((content) => (
                      <tr key={content.id}>
                        <td>{content.id}</td>
                        <td>{content.title}</td>
                        <td>{content.content_type || "Unbekannt"}</td>
                        <td>{new Date(content.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link 
                              href={`/h5p/content?id=${content.id}`} 
                              className="btn btn-xs btn-info"
                              target="_blank"
                            >
                              Ansehen
                            </Link>
                            <Link 
                              href={`/admin/edit/${content.id}`} 
                              className="btn btn-xs btn-warning"
                            >
                              Bearbeiten
                            </Link>                            <button 
                              onClick={async () => {
                                if (confirm(`Möchten Sie "${content.title}" wirklich löschen?`)) {
                                  try {
                                    const response = await fetch(`/api/admin/content/${content.id}`, {
                                      method: 'DELETE'
                                    });
                                    
                                    if (response.ok) {
                                      // Remove from state to update UI
                                      setContents(contents.filter(c => c.id !== content.id));
                                    } else {
                                      const errorData = await response.json();
                                      alert(`Fehler: ${errorData.error || 'Unbekannter Fehler'}`);
                                    }
                                  } catch (err) {
                                    console.error('Error deleting content:', err);
                                    alert('Beim Löschen ist ein Fehler aufgetreten');
                                  }
                                }
                              }}
                              className="btn btn-xs btn-error"
                            >
                              Löschen
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}          </div>
          
          {/* Test Component for H5P Extraction */}
          <TestExtraction />
        </div>
      </div>
    </>
  );
}
