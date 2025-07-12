"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

interface SubjectArea {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export default function SubjectAreasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    // For new subject area form
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // For editing subject area
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [editingAreaName, setEditingAreaName] = useState("");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  
  // Fetch subject areas when component loads
  useEffect(() => {
    const fetchSubjectAreas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/subject-areas");
        
        if (!response.ok) {
          throw new Error("Failed to fetch subject areas");
        }
        
        const data = await response.json();
        setSubjectAreas(data);
      } catch (err) {
        setError("Fehler beim Laden der Bereiche");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchSubjectAreas();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSubjectName.trim()) {
      setFormError("Bitte geben Sie einen Namen für den Bereich ein");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const response = await fetch("/api/admin/subject-areas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newSubjectName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Erstellen des Bereichs");
      }
      
      // Add the new subject area to the list
      setSubjectAreas([...subjectAreas, data]);
      
      // Reset form
      setNewSubjectName("");
      
    } catch (err: any) {
      setFormError(err.message || "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleStartEdit = (area: SubjectArea) => {
    setEditingAreaId(area.id);
    setEditingAreaName(area.name);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setEditingAreaId(null);
    setEditingAreaName("");
    setFormError(null);
  };

  const handleUpdateArea = async () => {
    if (!editingAreaId) return;
    
    if (!editingAreaName.trim()) {
      setFormError("Bitte geben Sie einen Namen für den Bereich ein");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const response = await fetch(`/api/admin/subject-areas/${editingAreaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingAreaName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Aktualisieren des Bereichs");
      }
      
      // Update the subject area in the list
      setSubjectAreas(subjectAreas.map(area => 
        area.id === editingAreaId ? 
        { ...area, name: editingAreaName, slug: data.slug } : 
        area
      ));
      
      // Reset edit mode
      setEditingAreaId(null);
      setEditingAreaName("");
      
    } catch (err: any) {
      setFormError(err.message || "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Möchten Sie diesen Bereich wirklich löschen?")) {
      try {
        const response = await fetch(`/api/admin/subject-areas/${id}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Fehler beim Löschen des Bereichs");
        }
        
        // Remove the deleted subject area from the list
        setSubjectAreas(subjectAreas.filter(area => area.id !== id));
        
      } catch (err: any) {
        alert(err.message || "Ein Fehler ist aufgetreten");
      }
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
      
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className=""></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 backdrop-blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32 backdrop-blur-2xl"></div>
        </div>
        
        <div className="relative container-fluid mx-auto  px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Bereiche verwalten
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Erstellen und bearbeiten Sie Bereiche für H5P-Inhalte
              </p>
            </div>
            <Link 
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-5">
        <div className="container-fluid mx-auto  px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Form for new subject area */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-primary to-primary p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Neuer Bereich</h2>
                  </div>
                  <p className="text-blue-100 mt-2 text-sm">
                    Erstellen Sie einen neuen Bereich
                  </p>
                </div>
                
                <form className="p-6" onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="subject-name">
                      Name des Bereichs
                    </label>
                    <div className="relative">
                      <input
                        id="subject-name"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        value={newSubjectName}
                        onChange={e => setNewSubjectName(e.target.value)}
                        required
                        placeholder="z.B. Mathematik, Informatik..."
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {formError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 text-sm">{formError}</p>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Wird erstellt...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Bereich erstellen
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* List of subject areas */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-primary to-primary p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Bereiche</h2>
                        <p className="text-blue-100 text-sm">
                          {subjectAreas.length} Bereich{subjectAreas.length !== 1 ? 'e' : ''} verfügbar
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-4">Bereiche werden geladen...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="p-4 bg-red-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                ) : subjectAreas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Keine Bereiche gefunden</p>
                    <p className="text-gray-500 text-sm mt-1">Erstellen Sie Ihren ersten Bereich</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                              ID
                            </div>
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              Name
                            </div>
                          </th>
                          <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              Slug
                            </div>
                          </th>
                          <th className="text-right py-4 px-6 font-semibold text-gray-700 bg-gray-50/50">
                            Aktionen
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {subjectAreas.map((area, index) => (
                          <tr 
                            key={area.id} 
                            className={`hover:bg-blue-50/50 transition-colors duration-150 ${
                              index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                                #{area.id}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {editingAreaId === area.id ? (
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80"
                                  value={editingAreaName}
                                  onChange={e => setEditingAreaName(e.target.value)}
                                  placeholder="Bereich Name eingeben"
                                  autoFocus
                                />
                              ) : (
                                <span className="font-medium text-gray-900">{area.name}</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                                {area.slug}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-end gap-2">
                                {editingAreaId === area.id ? (
                                  <>
                                    <button
                                      onClick={handleUpdateArea}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={isSubmitting}
                                    >
                                      {isSubmitting ? (
                                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                                      ) : (
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      Speichern
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50"
                                      disabled={isSubmitting}
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      Abbrechen
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <Link 
                                      href={`/bereiche/${area.slug}`} 
                                      target="_blank"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      Ansehen
                                    </Link>
                                    <button
                                      onClick={() => handleStartEdit(area)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Bearbeiten
                                    </button>
                                    <button
                                      onClick={() => handleDelete(area.id)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Löschen
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
