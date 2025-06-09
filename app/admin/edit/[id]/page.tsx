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
  const [subjectAreaId, setSubjectAreaId] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);

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
      );
      formData.append("tags", JSON.stringify(selectedTags));
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
                {content ? `Bearbeiten: ${content.title}` : "Inhalt bearbeiten"}
              </h1>
              <p className="text-primary-content/80 mt-2">
                H5P-Inhalt bearbeiten und aktualisieren
              </p>
            </div>
            <Link href="/admin" className="btn btn-outline btn-accent">
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-6xl px-4">
          {error ? (
            <div className="alert alert-error shadow-lg mb-8">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="font-bold">Fehler</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
              <div className="flex-none">
                <Link href="/admin" className="btn btn-sm">
                  Zurück zum Dashboard
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-sm ml-2"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          ) : content ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Edit Form */}
              <div
                className={`${
                  previewMode ? "hidden lg:block" : ""
                } lg:col-span-1`}
              >
                <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-base-300">
                    <h2 className="text-xl font-bold">Metadaten bearbeiten</h2>
                  </div>

                  <form
                    className="p-6"
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                  >                    <div className="form-control mb-4">
                      <label className="label" htmlFor="content-title">
                        <span className="label-text">Titel</span>
                      </label>
                      <input
                        id="content-title"
                        type="text"
                        className="input input-bordered"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Titel des H5P-Inhalts eingeben"
                        title="Titel des H5P-Inhalts"
                        required
                      />
                    </div>

                    <div className="form-control mb-4">
                      <label className="label" htmlFor="content-description">
                        <span className="label-text">Beschreibung (optional)</span>
                      </label>
                      <textarea
                        id="content-description"
                        className="textarea textarea-bordered w-full h-24"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="z.B. Interaktiver Questionnaire-Inhalt für ein besseres Lernerlebnis"
                        title="Beschreibung des H5P-Inhalts"
                      />
                      <label className="label">
                        <span className="label-text-alt">Diese Beschreibung wird auf der Inhaltsseite angezeigt</span>
                      </label>
                    </div>

                    <div className="form-control mb-4">
                      <label className="label" htmlFor="subject-area">
                        <span className="label-text">Fachbereich</span>
                      </label>
                      <select
                        id="subject-area"
                        className="select select-bordered w-full"
                        value={subjectAreaId || ""}
                        onChange={(e) =>
                          setSubjectAreaId(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      >
                        <option value="">-- Keiner --</option>
                        {subjectAreas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-control mb-6">
                      <label className="label">
                        <span className="label-text">Tags</span>
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-base-200 rounded-lg min-h-16">
                        {allTags.length === 0 ? (
                          <p className="text-sm opacity-70">
                            Keine Tags verfügbar
                          </p>
                        ) : (
                          allTags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              className={`badge ${
                                selectedTags.includes(tag.id)
                                  ? "badge-primary"
                                  : "badge-outline"
                              } p-3 cursor-pointer`}
                              onClick={() => handleTagToggle(tag.id)}
                            >
                              {tag.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="form-control w-full mb-4">
                      <label className="label" htmlFor="cover-image">
                        <span className="label-text font-medium">
                          Cover-Bild (optional)
                        </span>
                      </label>
                      <input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCoverImage(e.target.files?.[0] || null)
                        }
                        className="file-input file-input-bordered w-full"
                        title="Cover-Bild auswählen"
                      />
                      <label className="label">
                        <span className="label-text-alt">
                          Optional: Bild für die Vorschau (jpg, png, ...)
                        </span>
                      </label>
                    </div>

                    {saveError && (
                      <div className="alert alert-error mb-4">
                        <p>{saveError}</p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-between">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="btn btn-error"
                      >
                        Löschen
                      </button>

                      <button
                        type="submit"
                        className={`btn btn-primary ${
                          isSaving ? "loading" : ""
                        }`}
                        disabled={isSaving}
                      >
                        {isSaving
                          ? "Wird gespeichert..."
                          : "Änderungen speichern"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-8 bg-base-100 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-base-300">
                    <h2 className="text-xl font-bold">Inhaltsinformationen</h2>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-semibold block mb-1">
                          ID:
                        </span>
                        <span className="badge">{content.id}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold block mb-1">
                          Typ:
                        </span>
                        <span className="badge badge-accent">
                          {content.content_type || "Unbekannt"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold block mb-1">
                          Erstelldatum:
                        </span>
                        <span>
                          {new Date(content.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold block mb-1">
                          Slug:
                        </span>
                        <span className="text-sm font-mono bg-base-200 px-2 py-1 rounded">
                          {content.slug}
                        </span>
                      </div>
                    </div>

                    <div className="divider"></div>

                    <Link
                      href={`/h5p/content?id=${content.id}`}
                      target="_blank"
                      className="btn btn-outline w-full"
                    >
                      Vorschau (neues Fenster)
                    </Link>

                    <button
                      className="btn btn-outline w-full mt-2 lg:hidden"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode
                        ? "Bearbeitungsformular anzeigen"
                        : "Inhaltsvorschau anzeigen"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Preview */}
              <div
                className={`${
                  !previewMode && !isLoading ? "hidden lg:block" : ""
                } lg:col-span-2`}
              >
                <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-base-300 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Vorschau</h2>
                    <button
                      className="btn btn-outline btn-sm lg:hidden"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      Zurück zum Bearbeiten
                    </button>
                  </div>                  <div className="p-6">
                    {content && content.file_path && (
                      <div className="rounded-lg overflow-hidden border border-base-300">
                        {/* H5P component expects path to the directory containing h5p.json */}
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
