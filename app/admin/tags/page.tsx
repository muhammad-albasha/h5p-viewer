"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

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
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  
  // Fetch tags when component loads
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/tags");
        
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
      
      const response = await fetch("/api/admin/tags", {
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
                Tags verwalten
              </h1>
              <p className="text-primary-content/80 mt-2">
                Erstellen und bearbeiten Sie Tags für H5P-Inhalte
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
            {/* Form for new tag */}
            <div className="md:col-span-1">
              <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-base-300">
                  <h2 className="text-xl font-bold">Neuer Tag</h2>
                </div>
                <form className="p-6" onSubmit={handleSubmit}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Name des Tags</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={newTagName}
                      onChange={e => setNewTagName(e.target.value)}
                      required
                      title="Name des Tags"
                      placeholder="Geben Sie den Tag-Namen ein"
                    />
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
                    {isSubmitting ? "Wird erstellt..." : "Tag erstellen"}
                  </button>
                </form>
              </div>
            </div>
            
            {/* List of tags */}
            <div className="md:col-span-2">
              <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-base-300">
                  <h2 className="text-xl font-bold">Tags</h2>
                  <p className="text-sm opacity-70">
                    Alle verfügbaren Tags
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
                ) : tags.length === 0 ? (
                  <div className="p-8 text-center">
                    <p>Keine Tags gefunden</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Aktionen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tags.map((tag) => (
                          <tr key={tag.id}>
                            <td>{tag.id}</td>
                            <td>{tag.name}</td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDelete(tag.id)}
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
