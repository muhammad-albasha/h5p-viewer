"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

interface H5PContent {
  id: number;
  title: string;
  slug: string;
  content_type: string;
  created_at: string;
  subject_area_name?: string;
  tags?: Array<{ id: number | string; name: string }>;
  isDeleting?: boolean; // UI-Status für das Löschen
  featured?: boolean; // Featured status
  isToggling?: boolean; // UI-Status für Featured toggle
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<H5PContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        
        // Load featured content to mark featured status
        try {
          const featuredResponse = await fetch("/api/featured");
          if (featuredResponse.ok) {
            const featuredData = await featuredResponse.json();
            const featuredIds = featuredData.map((item: any) => item.id);
            
            // Mark featured status
            const contentsWithFeatured = data.map((content: H5PContent) => ({
              ...content,
              featured: featuredIds.includes(content.id)
            }));
            
            setContents(contentsWithFeatured);
          } else {
            setContents(data);
          }
        } catch (featuredError) {
          // If featured loading fails, just set regular content
          setContents(data);
        }
          } catch (err) {
        setError("Fehler beim Laden der Inhalte");
        // Error logged silently
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchContents();
    }
  }, [status]);

  const toggleFeatured = async (contentId: number) => {
    try {
      // Set loading state for this specific item
      setContents(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, isToggling: true }
          : content
      ));

      const response = await fetch(`/api/admin/featured/${contentId}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Toggle failed');
      }      // Update featured status
      setContents(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, featured: result.featured, isToggling: false }
          : content
      ));

      setSuccessMessage(result.message);
        // Notify other tabs/windows that featured content has changed
      window.dispatchEvent(new CustomEvent('featuredContentChanged'));
      
      // Also use localStorage for cross-tab communication
      localStorage.setItem('featuredContentLastChange', Date.now().toString());
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fehler beim Aktualisieren');
      
      // Remove loading state
      setContents(prev => prev.map(content => 
        content.id === contentId 
          ? { ...content, isToggling: false }
          : content
      ));

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
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
      <Navbar />      <Header />

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
            </div>            <div className="flex gap-2">
              <Link
                href="/admin/2fa"
                className="btn btn-sm btn-outline"
              >
                2FA-Einstellungen
              </Link>
              <Link
                href="/admin/pages"
                className="btn btn-sm btn-outline"
              >
                Seiten-Einstellungen
              </Link>
              <Link
                href="/admin/subject-areas"
                className="btn btn-sm btn-outline"
              >
                Fachbereiche
              </Link>
              <Link href="/admin/tags" className="btn btn-sm btn-outline">
                Tags
              </Link>
              <Link
                href="/admin/upload"
                className="btn btn-accent hover:btn-accent-focus"
              >
                Neuen H5P-Inhalt hochladen
              </Link>
            </div>
          </div>        </div>
      </div>

      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Success Message */}
          {successMessage && (
            <div className="alert alert-success mb-6">
              <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}
          
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
              </div>            ) : (                <div className="overflow-x-auto">                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ID</th><th>Titel</th><th>Typ</th><th>Fachbereich</th><th>Tags</th><th>Erstellt am</th><th>Featured</th><th>Aktionen</th>
                    </tr>
                  </thead><tbody>{contents.map((content) => (
                      <tr key={content.id}>
                        <td>{content.id}</td><td>{content.title}</td><td>{content.content_type || "Unbekannt"}</td><td>
                          {content.subject_area_name ? (
                            <span className="badge badge-outline">
                              {content.subject_area_name}
                            </span>
                          ) : (
                            <span className="text-opacity-50">-</span>
                          )}
                        </td><td>
                          <div className="flex flex-wrap gap-1">
                            {content.tags && content.tags.length > 0 ? (
                              content.tags.map((tag) => (
                                <span key={tag.id} className="badge badge-sm">
                                  {tag.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-opacity-50">-</span>
                            )}
                          </div>
                        </td><td>
                          {new Date(content.created_at).toLocaleDateString()}
                        </td><td>
                          <div className="flex items-center gap-2">
                            {content.featured && (
                              <div className="badge badge-primary badge-sm">Featured</div>
                            )}
                            <label className="cursor-pointer">
                              <input
                                type="checkbox"
                                className="toggle toggle-primary toggle-sm"
                                checked={content.featured || false}
                                disabled={content.isToggling}
                                onChange={() => toggleFeatured(content.id)}
                                title={content.featured ? "Als Featured entfernen" : "Als Featured markieren"}
                              />
                            </label>
                            {content.isToggling && (
                              <span className="loading loading-spinner loading-xs"></span>
                            )}
                          </div>
                        </td><td>
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
                            </Link>
                            <button
                              onClick={async () => {
                                if (
                                  confirm(
                                    `Möchten Sie "${content.title}" wirklich löschen? Dies löscht sowohl den Datenbankeintrag als auch alle zugehörigen Dateien vom Server.`
                                  )
                                ) {
                                  try {
                                    // Zeige Ladeindikator für die zu löschende Zeile
                                    const contentBeingDeleted = content.id;
                                    setContents(
                                      contents.map(c => 
                                        c.id === contentBeingDeleted 
                                          ? {...c, isDeleting: true} 
                                          : c
                                      )
                                    );
                                    
                                    const response = await fetch(
                                      `/api/admin/content/${content.id}`,
                                      {
                                        method: "DELETE",
                                      }
                                    );

                                    if (response.ok) {
                                      // Remove from state to update UI
                                      setContents(
                                        contents.filter(
                                          (c) => c.id !== content.id
                                        )
                                      );
                                      // Erfolgsmeldung
                                      alert("Inhalt erfolgreich gelöscht. Alle zugehörigen H5P-Dateien wurden vom Server entfernt.");
                                    } else {
                                      // Entferne Ladeindikator
                                      setContents(
                                        contents.map(c => 
                                          c.id === contentBeingDeleted 
                                            ? {...c, isDeleting: false} 
                                            : c
                                        )
                                      );
                                      
                                      let errorMessage = "Unbekannter Fehler";
                                      try {
                                        const errorData = await response.json();
                                        errorMessage = errorData.error || errorMessage;
                                      } catch (parseError) {
                                        // Error parsing response, use default message
                                      }
                                      
                                      alert(`Fehler: ${errorMessage}`);
                                    }
                                  } catch (err) {
                                    // Error during deletion
                                    alert(
                                      "Beim Löschen ist ein Fehler aufgetreten"
                                    );
                                  }
                                }
                              }}
                              className="btn btn-xs btn-error"
                              disabled={content.isDeleting}
                            >
                              {content.isDeleting ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : "Löschen"}                            </button>
                          </div>
                        </td></tr>
                    ))}</tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
