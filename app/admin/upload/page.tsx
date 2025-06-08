"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

interface SubjectArea {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function UploadH5P() {
  const router = useRouter();
  const { data: session } = useSession();  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedSubjectArea, setSelectedSubjectArea] = useState<string>("none");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  
  // Fetch subject areas and tags when component loads
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);
        
        // Fetch subject areas
        const subjectAreaResponse = await fetch("/api/admin/subject-areas");
        if (!subjectAreaResponse.ok) {
          throw new Error("Failed to fetch subject areas");
        }
        const subjectAreaData = await subjectAreaResponse.json();
        setSubjectAreas(subjectAreaData);
        
        // Fetch tags
        const tagsResponse = await fetch("/api/admin/tags");
        if (!tagsResponse.ok) {
          throw new Error("Failed to fetch tags");
        }
        const tagsData = await tagsResponse.json();        setTags(tagsData);
      } catch (err) {
        // Error loading options
      } finally {
        setIsLoadingOptions(false);
      }
    };
    
    fetchOptions();
  }, []);
  
  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Bitte wählen Sie eine H5P-Datei aus");
      return;
    }
    
    if (!title.trim()) {
      setError("Bitte geben Sie einen Titel ein");
      return;
    }
    
    // Check if file is H5P format
    if (!file.name.endsWith('.h5p')) {
      setError("Bitte laden Sie nur H5P-Dateien hoch (.h5p)");
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);      // Create FormData object to send the file and metadata
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("subjectAreaId", selectedSubjectArea);
      formData.append("tags", JSON.stringify(selectedTags));
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }
      
      // Simulate upload progress for demo purposes
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Send request to API
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload fehlgeschlagen");
      }
      
      setProgress(100);
      
      // Redirect to admin dashboard after successful upload
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <Header />
      
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="btn btn-circle btn-ghost text-primary-content"
            >
              ←
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                H5P-Inhalt hochladen
              </h1>
              <p className="text-primary-content/80 mt-2">
                Laden Sie neue H5P-Inhalte für Ihre Plattform hoch
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-2xl px-4">
          <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-base-300">
              <h2 className="text-xl font-bold">Upload-Formular</h2>
              <p className="text-sm opacity-70">
                Füllen Sie alle erforderlichen Felder aus
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-error/10 border-l-4 border-error p-4 rounded">
                  <p className="text-error">{error}</p>
                </div>
              )}
                <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Titel des Inhalts</span>
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered w-full" 
                  placeholder="z.B. Grammatik-Quiz: For oder Since"
                  required
                />
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Beschreibung (optional)</span>
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea textarea-bordered w-full h-24" 
                  placeholder="z.B. Interaktiver Questionnaire-Inhalt für ein besseres Lernerlebnis"
                />
                <label className="label">
                  <span className="label-text-alt">Diese Beschreibung wird auf der Inhaltsseite angezeigt</span>
                </label>
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Fachbereich</span>
                </label>                <select 
                  className="select select-bordered w-full" 
                  value={selectedSubjectArea}
                  onChange={(e) => setSelectedSubjectArea(e.target.value)}
                  disabled={isLoadingOptions}
                  aria-label="Fachbereich auswählen"
                >
                  <option value="none">Keinen Fachbereich auswählen</option>
                  {subjectAreas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
                {selectedSubjectArea === "none" && (
                  <label className="label">
                    <span className="label-text-alt text-warning">
                      Empfohlen: Wählen Sie einen Fachbereich
                    </span>
                  </label>
                )}
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Tags</span>
                </label>
                <div className="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg min-h-16">
                  {isLoadingOptions ? (
                    <div className="loading loading-spinner loading-sm"></div>
                  ) : tags.length === 0 ? (
                    <p className="text-sm opacity-70">Keine Tags verfügbar</p>
                  ) : (
                    tags.map(tag => (
                      <div 
                        key={tag.id} 
                        className={`badge ${selectedTags.includes(tag.id) 
                          ? 'badge-primary' 
                          : 'badge-outline'} cursor-pointer`}
                        onClick={() => handleTagToggle(tag.id)}
                      >
                        {tag.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="form-control w-full">
                <label className="label" htmlFor="h5p-file">
                  <span className="label-text font-medium">H5P-Datei</span>
                </label>
                <input 
                  id="h5p-file"
                  type="file"
                  accept=".h5p"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="file-input file-input-bordered w-full" 
                  title="H5P-Datei auswählen"
                  required
                />
                <label className="label">
                  <span className="label-text-alt">Nur .h5p Dateien</span>
                </label>
              </div>
              
              <div className="form-control w-full">
                <label className="label" htmlFor="cover-image">
                  <span className="label-text font-medium">Cover-Bild (optional)</span>
                </label>
                <input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                  className="file-input file-input-bordered w-full"
                  title="Cover-Bild auswählen"
                />
                <label className="label">
                  <span className="label-text-alt">Optional: Bild für die Vorschau (jpg, png, ...)</span>
                </label>
              </div>
              
              {isUploading && (
                <div className="w-full">
                  <progress 
                    className="progress progress-primary w-full" 
                    value={progress} 
                    max="100"
                  ></progress>
                  <p className="text-sm text-center mt-2">
                    {progress < 100 
                      ? `Upload läuft: ${progress}%` 
                      : "Upload abgeschlossen!"}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Link href="/admin" className="btn btn-ghost">
                  Abbrechen
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isUploading}
                >
                  {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
