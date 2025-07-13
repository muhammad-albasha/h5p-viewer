"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import { withBasePath } from "../../utils/paths";

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export default function TagsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // For new tag form
  const [newTagName, setNewTagName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // For editing tag
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState("");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(withBasePath("/login"));
    }
  }, [status, router]);
  
  // Fetch tags when component loads
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(withBasePath("/api/admin/tags"));
        
        if (!response.ok) {
          throw new Error("Failed to fetch tags");
        }
        
        const data = await response.json();
        setTags(data);
      } catch (err) {
        setError("Fehler beim Laden der Tags");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status === "authenticated") {
      fetchTags();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTagName.trim()) {
      setFormError("Bitte geben Sie einen Namen für den Tag ein");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const response = await fetch(withBasePath("/api/admin/tags"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTagName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Erstellen des Tags");
      }
      
      // Add the new tag to the list
      setTags([...tags, data]);
      
      // Reset form
      setNewTagName("");
      
    } catch (err: any) {
      setFormError(err.message || "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagName("");
    setFormError(null);
  };

  const handleUpdateTag = async () => {
    if (!editingTagId) return;
    
    if (!editingTagName.trim()) {
      setFormError("Bitte geben Sie einen Namen für den Tag ein");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError(null);
      
      const response = await fetch(`/api/admin/tags/${editingTagId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editingTagName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Aktualisieren des Tags");
      }
      
      // Update the tag in the list
      setTags(tags.map(tag => tag.id === editingTagId ? { ...tag, name: editingTagName } : tag));
      
      // Reset edit mode
      setEditingTagId(null);
      setEditingTagName("");
      
    } catch (err: any) {
      setFormError(err.message || "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Möchten Sie diesen Tag wirklich löschen?")) {
      try {
        const response = await fetch(`/api/admin/tags/${id}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Fehler beim Löschen des Tags");
        }
        
        // Remove the deleted tag from the list
        setTags(tags.filter(tag => tag.id !== id));
        
      } catch (err: any) {
        alert(err.message || "Ein Fehler ist aufgetreten");
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }
  return (
    <>
      <Navbar />
      <Header />
      
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-primary dark:bg-black">
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Tags verwalten
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Erstellen und bearbeiten Sie Tags für H5P-Inhalte
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
            {/* Form for new tag */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-primary to-primary p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Neuer Tag</h2>
                  </div>
                  <p className="text-blue-100 mt-2 text-sm">
                    Erstellen Sie einen neuen Tag
                  </p>
                </div>
                
                <form className="p-6" onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="tag-name">
                      Name des Tags
                    </label>
                    <div className="relative">
                      <input
                        id="tag-name"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        value={newTagName}
                        onChange={e => setNewTagName(e.target.value)}
                        required
                        placeholder="z.B. Mathematik, Spiel..."
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
                    className="w-full bg-primary dark:bg-black hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
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
                        Tag erstellen
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            {/* List of tags */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-primary to-primary p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Tags</h2>
                        <p className="text-blue-100 text-sm">
                          {tags.length} Tag{tags.length !== 1 ? 's' : ''} verfügbar
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-600 mt-4">Tags werden geladen...</p>
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
                ) : tags.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium">Keine Tags gefunden</p>
                    <p className="text-gray-500 text-sm mt-1">Erstellen Sie Ihren ersten Tag</p>
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              Name
                            </div>
                          </th>
                          <th className="text-right py-4 px-6 font-semibold text-gray-700 bg-gray-50/50">
                            Aktionen
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {tags.map((tag, index) => (
                          <tr 
                            key={tag.id} 
                            className={`hover:bg-blue-50/50 transition-colors duration-150 ${
                              index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                            }`}
                          >
                            <td className="py-4 px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                                #{tag.id}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              {editingTagId === tag.id ? (
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/80"
                                  value={editingTagName}
                                  onChange={e => setEditingTagName(e.target.value)}
                                  placeholder="Tag Name eingeben"
                                  autoFocus
                                />
                              ) : (
                                <span className="font-medium text-gray-900">{tag.name}</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex justify-end gap-2">
                                {editingTagId === tag.id ? (
                                  <>
                                    <button
                                      onClick={handleUpdateTag}
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
                                    <button
                                      onClick={() => handleStartEdit(tag)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      Bearbeiten
                                    </button>
                                    <button
                                      onClick={() => handleDelete(tag.id)}
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
