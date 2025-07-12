"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import PlayH5p from "@/app/components/PlayH5p";

interface ContentData {
  id: number;
  title: string;
  description?: string;
  slug: string;
  file_path: string;
  content_type: string;
  created_at: string;
  subject_area_id: number | null;
  subject_area_name: string | null;
  tags: Array<{ id: number; name: string }>;
  cover_image_path?: string;
  password?: string;
}

interface SubjectArea {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function EditContent() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;

  const [content, setContent] = useState<ContentData | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectAreaId, setSubjectAreaId] = useState<number | null>(null);  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);  const [previewMode, setPreviewMode] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  useEffect(() => {
    const fetchContentData = async () => {
      try {
        setIsLoading(true);
        setSaveError(null);
        setError(null);
        const response = await fetch(`/api/admin/content/${contentId}`, {
          // Add cache: 'no-store' to prevent caching issues
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          let errorMessage = `Failed to fetch content data: ${response.status} ${response.statusText}`;

          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseErr) {
            const errorText = await response.text();
            // Parse error logged for debugging
          }

          throw new Error(errorMessage);
        }
        const data = await response.json();
        // Content data received

        if (!data.content) {
          throw new Error("Invalid content data received from API");
        }

        setContent(data.content);
        setAllTags(Array.isArray(data.allTags) ? data.allTags : []);
        setSubjectAreas(
          Array.isArray(data.subjectAreas) ? data.subjectAreas : []
        );        // Initialize form state with safe defaults
        setTitle(data.content.title || "");
        setDescription(data.content.description || "");
        setSubjectAreaId(data.content.subject_area_id || null);
        setPassword(data.content.password || "");

        // Safely handle tags
        if (data.content.tags && Array.isArray(data.content.tags)) {
          setSelectedTags(data.content.tags.map((tag: Tag) => tag.id));
        } else {
          setSelectedTags([]);
          // Content tags not in expected format
        }
      } catch (err: any) {
        setError(err.message || "Error loading content data");
        // Error in fetchContentData logged
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated" && contentId) {
      fetchContentData();
    }
  }, [status, contentId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSaveError(null);      // Use FormData to support file upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append(
        "subject_area_id",
        subjectAreaId ? String(subjectAreaId) : ""
      );      formData.append("tags", JSON.stringify(selectedTags));
      formData.append("password", password);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      const response = await fetch(`/api/admin/content/${contentId}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        let errorMessage = "Failed to save changes";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);      }
      // Update local content data with the new values
      if (content) {
        setContent({
          ...content,
          title,
          description,
          subject_area_id: subjectAreaId,
          subject_area_name:
            subjectAreas.find((sa) => sa.id === subjectAreaId)?.name || null,
          tags: selectedTags.map((id) => {
            const tag = allTags.find((t) => t.id === id);
            return { id, name: tag ? tag.name : "" };
          }),
        });
      }
      alert("Änderungen erfolgreich gespeichert");
    } catch (err: any) {
      setSaveError(err.message || "Ein Fehler ist aufgetreten");
      // Save error logged
    } finally {
      setIsSaving(false);
    }
  };
  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCoverImage(file);
    
    if (file) {
      // Create preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);
    } else {      setCoverImagePreview(null);
    }
  };

  // Cleanup preview URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (coverImagePreview && coverImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverImagePreview);
      }
    };
  }, [coverImagePreview]);

  const handleDelete = async () => {
    if (!content) return;

    if (
      confirm(
        `Möchten Sie "${content.title}" wirklich löschen? Dies löscht sowohl den Datenbankeintrag als auch alle zugehörigen Dateien vom Server.`
      )
    ) {
      try {
        setIsSaving(true);

        const response = await fetch(`/api/admin/content/${contentId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          let errorMessage = "Failed to delete content";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (parseError) {
            // Error parsing error response
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        // Content deleted successfully
        // Erfolgsmeldung mit mehr Details
        alert(
          "Inhalt erfolgreich gelöscht. Alle zugehörigen H5P-Dateien wurden vom Server entfernt."
        );
        router.push("/admin");
      } catch (err: any) {
        const errorMsg =
          err.message || "Ein unbekannter Fehler ist aufgetreten";
        // Delete error logged
        alert(`Fehler beim Löschen: ${errorMsg}`);
      } finally {
        setIsSaving(false);
      }
    }
  };
  if (status === "loading" || (isLoading && !error)) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Inhalt wird geladen...</p>
          </div>
        </div>
      </>
    );
  }  return (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {content ? `${content.title}` : "Inhalt bearbeiten"}
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                H5P-Inhalt bearbeiten und aktualisieren
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
      <div className="min-h-screen bg-gradient-to-br from-primary via-secondary to-primary py-5">
        <div className="container-fluid mx-auto  px-4">
          {error ? (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Fehler beim Laden</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <div className="flex gap-3">
                    <Link 
                      href="/admin" 
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Zurück zum Dashboard
                    </Link>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Erneut versuchen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : content ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {/* Left Column - Edit Form */}
              <div className={`${previewMode ? "hidden lg:block" : ""} lg:col-span-1 space-y-6`}>
                
                {/* Edit Form Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">

                  <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                    {saveError && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-red-700 font-medium">{saveError}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="content-title">
                        Titel
                      </label>
                      <div className="relative">
                        <input
                          id="content-title"
                          type="text"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Titel des H5P-Inhalts eingeben"
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="content-description">
                        Beschreibung (optional)
                      </label>
                      <textarea
                        id="content-description"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="z.B. Interaktiver Questionnaire-Inhalt für ein besseres Lernerlebnis"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">Diese Beschreibung wird auf der Inhaltsseite angezeigt</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="content-password">
                        Passwort-Schutz (optional)
                      </label>
                      <input
                        id="content-password"
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Passwort eingeben (leer lassen für öffentlichen Zugriff)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Wenn gesetzt, müssen Benutzer dieses Passwort eingeben, um den Inhalt anzuzeigen</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="subject-area">
                        Bereich
                      </label>
                      <div className="relative">
                        <select
                          id="subject-area"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none"
                          value={subjectAreaId || ""}
                          onChange={(e) => setSubjectAreaId(e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">-- Keiner --</option>
                          {subjectAreas.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="p-4 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm min-h-[4rem]">
                        {allTags.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center">Keine Tags verfügbar</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                                  selectedTags.includes(tag.id)
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => handleTagToggle(tag.id)}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="cover-image">
                        Cover-Bild (optional)
                      </label>
                      
                      {(coverImagePreview || content?.cover_image_path) && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            {coverImagePreview ? 'Vorschau (neues Bild):' : 'Aktuelles Cover-Bild:'}
                          </p>
                          <div className="relative inline-block">
                            <img
                              src={coverImagePreview || content?.cover_image_path}
                              alt="Cover"
                              className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            {coverImagePreview && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverImage(null);
                                  setCoverImagePreview(null);
                                  const fileInput = document.getElementById('cover-image') as HTMLInputElement;
                                  if (fileInput) fileInput.value = '';
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors"
                                title="Neues Bild entfernen"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Optional: Bild für die Vorschau (JPG, PNG, etc.)</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Löschen
                      </button>

                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Wird gespeichert...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Änderungen speichern
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Content Info Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-semibold text-gray-700 mb-1">ID:</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                          #{content.id}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-gray-700 mb-1">Typ:</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800">
                          {content.content_type || "Unbekannt"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-gray-700 mb-1">Erstelldatum:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(content.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-gray-700 mb-1">Slug:</span>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                          {content.slug}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <Link
                        href={`/h5p/content?id=${content.id}`}
                        target="_blank"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Vorschau (neues Fenster)
                      </Link>

                      <button
                        className="w-full lg:hidden bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        {previewMode ? "Bearbeitungsformular anzeigen" : "Inhaltsvorschau anzeigen"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className={`${!previewMode ? "hidden lg:block" : ""} lg:col-span-2`}>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">

                  <div className="p-6">
                    {content && content.file_path && (
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                        <PlayH5p h5pJsonPath={content.file_path} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
