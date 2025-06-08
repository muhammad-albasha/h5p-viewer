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
  color?: string;
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
  const [newSubjectColor, setNewSubjectColor] = useState("#3b82f6"); // Default blue color
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // For editing subject area
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [editingAreaName, setEditingAreaName] = useState("");
  const [editingAreaColor, setEditingAreaColor] = useState("#3b82f6");
  
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
        
        const data = await response.json();        setSubjectAreas(data);
      } catch (err) {
        setError("Fehler beim Laden der Fachbereiche");
        // Error logged silently
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
      setFormError("Bitte geben Sie einen Namen für den Fachbereich ein");
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
        body: JSON.stringify({ 
          name: newSubjectName,
          color: newSubjectColor 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Erstellen des Fachbereichs");
      }
      
      // Add the new subject area to the list
      setSubjectAreas([...subjectAreas, data]);
      
      // Reset form
      setNewSubjectName("");
      setNewSubjectColor("#3b82f6");
      
    } catch (err: any) {
      setFormError(err.message || "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };  const handleStartEdit = (area: SubjectArea) => {
    setEditingAreaId(area.id);
    setEditingAreaName(area.name);
    setEditingAreaColor(area.color || "#3b82f6");
    setFormError(null);
  };
  const handleCancelEdit = () => {
    setEditingAreaId(null);
    setEditingAreaName("");
    setEditingAreaColor("#3b82f6");
    setFormError(null);
  };

  const handleUpdateArea = async () => {
    if (!editingAreaId) return;
    
    if (!editingAreaName.trim()) {
      setFormError("Bitte geben Sie einen Namen für den Fachbereich ein");
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
        body: JSON.stringify({ 
          name: editingAreaName,
          color: editingAreaColor 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Fehler beim Aktualisieren des Fachbereichs");
      }
      
      // Update the subject area in the list
      setSubjectAreas(subjectAreas.map(area => 
        area.id === editingAreaId ? 
        { ...area, name: editingAreaName, color: editingAreaColor, slug: data.slug } : 
        area
      ));
      
      // Reset edit mode
      setEditingAreaId(null);
      setEditingAreaName("");
      setEditingAreaColor("#3b82f6");
      
    } catch (err: any) {
      setFormError(err.message || "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Möchten Sie diesen Fachbereich wirklich löschen?")) {
      try {
        const response = await fetch(`/api/admin/subject-areas/${id}`, {
          method: "DELETE",
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Fehler beim Löschen des Fachbereichs");
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
      
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Fachbereiche verwalten
              </h1>
              <p className="text-primary-content/80 mt-2">
                Erstellen und bearbeiten Sie Fachbereiche für H5P-Inhalte
              </p>
            </div>
            <Link 
              href="/admin" 
              className="btn btn-outline btn-accent"
            >
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form for new subject area */}
            <div className="md:col-span-1">
              <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-base-300">
                  <h2 className="text-xl font-bold">Neuer Fachbereich</h2>
                </div>
                <form className="p-6" onSubmit={handleSubmit}>                  <div className="form-control mb-4">
                    <label className="label" htmlFor="subject-name">
                      <span className="label-text">Name des Fachbereichs</span>
                    </label>
                    <input
                      id="subject-name"
                      type="text"
                      className="input input-bordered"
                      value={newSubjectName}
                      onChange={e => setNewSubjectName(e.target.value)}
                      required
                      title="Name des Fachbereichs"
                      placeholder="Name des Fachbereichs eingeben"
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label" htmlFor="subject-color">
                      <span className="label-text">Farbe des Fachbereichs</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="subject-color"
                        type="color"
                        className="w-12 h-12 rounded-lg border-2 border-base-300 cursor-pointer"
                        value={newSubjectColor}
                        onChange={e => setNewSubjectColor(e.target.value)}
                        title="Farbe auswählen"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={newSubjectColor}
                          onChange={e => setNewSubjectColor(e.target.value)}
                          placeholder="#3b82f6"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          title="Hex-Farbcode (z.B. #3b82f6)"
                        />
                        <div className="text-xs text-base-content/60 mt-1">
                          Diese Farbe ersetzt die Standard-Sekundärfarbe
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {formError && (
                    <div className="alert alert-error mb-4">
                      <p>{formError}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    className={`btn btn-primary w-full ${isSubmitting ? "loading" : ""}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Wird erstellt..." : "Fachbereich erstellen"}
                  </button>
                </form>
              </div>
            </div>
            
            {/* List of subject areas */}
            <div className="md:col-span-2">
              <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-base-300">
                  <h2 className="text-xl font-bold">Fachbereiche</h2>
                  <p className="text-sm opacity-70">
                    Alle verfügbaren Fachbereiche
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
                ) : subjectAreas.length === 0 ? (
                  <div className="p-8 text-center">
                    <p>Keine Fachbereiche gefunden</p>
                  </div>                ) : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Slug</th>
                          <th>Farbe</th>
                          <th>Aktionen</th>
                        </tr>                      </thead>
                      <tbody>
                        {subjectAreas.map((area) => (
                          <tr key={area.id}>
                            <td>{area.id}</td>
                            <td>
                              {editingAreaId === area.id ? (
                                <input
                                  type="text"
                                  className="input input-bordered input-sm w-full"
                                  value={editingAreaName}
                                  onChange={e => setEditingAreaName(e.target.value)}
                                  title="Fachbereich Name bearbeiten"
                                  placeholder="Fachbereich Name eingeben"
                                  autoFocus
                                />
                              ) : (
                                area.name
                              )}
                            </td>
                            <td>{area.slug}</td>
                            <td>
                              {editingAreaId === area.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    className="w-8 h-8 rounded border cursor-pointer"
                                    value={editingAreaColor}
                                    onChange={e => setEditingAreaColor(e.target.value)}                                    title="Farbe auswählen"
                                  />
                                  <input
                                    type="text"
                                    className="input input-bordered input-xs w-20"
                                    value={editingAreaColor}
                                    onChange={e => setEditingAreaColor(e.target.value)}
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    title="Hex-Farbcode"
                                    placeholder="#000000"                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    className="w-6 h-6 rounded border pointer-events-none"
                                    value={area.color || '#3b82f6'}
                                    readOnly
                                    title={`Farbe: ${area.color || '#3b82f6'}`}
                                  />
                                  <span className="text-xs font-mono">
                                    {area.color || '#3b82f6'}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="flex gap-2">
                                {editingAreaId === area.id ? (
                                  <>
                                    <button
                                      onClick={handleUpdateArea}
                                      className={`btn btn-xs btn-success ${isSubmitting ? "loading" : ""}`}
                                      disabled={isSubmitting}
                                    >
                                      Speichern
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="btn btn-xs btn-ghost"
                                      disabled={isSubmitting}
                                    >
                                      Abbrechen
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <Link 
                                      href={`/fachbereich/${area.slug}`} 
                                      className="btn btn-xs btn-info"
                                      target="_blank"
                                    >
                                      Ansehen
                                    </Link>
                                    <button
                                      onClick={() => handleStartEdit(area)}
                                      className="btn btn-xs btn-warning"
                                    >
                                      Bearbeiten
                                    </button>
                                    <button
                                      onClick={() => handleDelete(area.id)}
                                      className="btn btn-xs btn-error"
                                    >
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
