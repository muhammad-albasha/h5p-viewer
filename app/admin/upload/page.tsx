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
      
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 backdrop-blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32 backdrop-blur-2xl"></div>
        </div>
        
        <div className="relative container-fluid mx-auto  px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  H5P-Inhalt hochladen
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Laden Sie neue H5P-Inhalte für Ihre Plattform hoch
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="container-fluid mx-auto  px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">Upload-Formular</h2>
              </div>
              <p className="text-blue-100 mt-2 text-sm">
                Füllen Sie alle erforderlichen Felder aus
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="title">
                  Titel des Inhalts
                </label>
                <div className="relative">
                  <input 
                    id="title"
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm" 
                    placeholder="z.B. Grammatik-Quiz: For oder Since"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">
                  Beschreibung (optional)
                </label>
                <textarea 
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none" 
                  placeholder="z.B. Interaktiver Questionnaire-Inhalt für ein besseres Lernerlebnis"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Diese Beschreibung wird auf der Inhaltsseite angezeigt</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="subject-area">
                  Bereich
                </label>
                <div className="relative">
                  <select 
                    id="subject-area"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none" 
                    value={selectedSubjectArea}
                    onChange={(e) => setSelectedSubjectArea(e.target.value)}
                    disabled={isLoadingOptions}
                  >
                    <option value="none">Keinen Bereich auswählen</option>
                    {subjectAreas.map(area => (
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
                {selectedSubjectArea === "none" && (
                  <p className="text-xs text-amber-600 mt-1">
                    Empfohlen: Wählen Sie einen Bereich
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags
                </label>
                <div className="p-4 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm min-h-[4rem]">
                  {isLoadingOptions ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                  ) : tags.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">Keine Tags verfügbar</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
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
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="h5p-file">
                  H5P-Datei
                </label>
                <div className="relative">
                  <input 
                    id="h5p-file"
                    type="file"
                    accept=".h5p"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Nur .h5p Dateien sind erlaubt</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="cover-image">
                  Cover-Bild (optional)
                </label>
                <div className="relative">
                  <input
                    id="cover-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional: Bild für die Vorschau (JPG, PNG, etc.)</p>
              </div>
              
              {isUploading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Upload-Fortschritt</span>
                    <span className="text-sm font-medium text-blue-700">{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className={`bg-blue-500 h-2 rounded-full transition-all duration-300 w-[${progress}%]`}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-600 mt-2 text-center">
                    {progress < 100 
                      ? 'Upload läuft...' 
                      : 'Upload abgeschlossen!'}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 pt-6">
                <Link 
                  href="/admin" 
                  className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 text-center"
                >
                  Abbrechen
                </Link>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Wird hochgeladen...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Hochladen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
