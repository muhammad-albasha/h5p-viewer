"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

export default function UploadH5P() {
  const router = useRouter();
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
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
      setError(null);
      
      // Create FormData object to send the file and metadata
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      
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
