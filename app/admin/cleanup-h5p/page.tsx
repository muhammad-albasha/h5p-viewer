"use client";
import { useState, useEffect } from "react";
import { withBasePath } from "@/app/utils/paths";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

interface OrphanedData {
  orphanedFolders: string[];
  totalOrphaned: number;
  validSlugs: string[];
}

interface CleanupResult {
  message: string;
  deletedFolders: string[];
  deletedCount: number;
  errors: string[];
}

export default function H5PCleanupPage() {
  const [orphanedData, setOrphanedData] = useState<OrphanedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrphanedFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(withBasePath("/api/admin/cleanup-h5p"));
      if (!response.ok) {
        throw new Error("Failed to fetch orphaned files");
      }
      const data = await response.json();
      setOrphanedData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupOrphanedFiles = async () => {
    setIsCleaningUp(true);
    setError(null);
    setCleanupResult(null);
    try {
      const response = await fetch(withBasePath("/api/admin/cleanup-h5p"), {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to cleanup orphaned files");
      }
      const result = await response.json();
      setCleanupResult(result);
      // Refresh the data
      await fetchOrphanedFiles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCleaningUp(false);
    }
  };

  useEffect(() => {
    fetchOrphanedFiles();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              H5P Dateien Bereinigung
            </h1>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Diese Seite hilft dabei, verwaiste H5P-Dateien zu identifizieren und zu löschen. 
                Verwaiste Dateien sind Ordner in <code>/public/h5p/</code>, die nicht mehr 
                einem Inhalt in der Datenbank entsprechen.
              </p>
              
              <button
                onClick={fetchOrphanedFiles}
                disabled={isLoading}
                className="btn btn-primary mr-4"
              >
                {isLoading ? "Überprüfe..." : "Erneut überprüfen"}
              </button>
            </div>

            {error && (
              <div className="alert alert-error mb-6">
                <span>{error}</span>
              </div>
            )}

            {cleanupResult && (
              <div className="alert alert-success mb-6">
                <div>
                  <div className="font-semibold">{cleanupResult.message}</div>
                  <div>Gelöschte Ordner: {cleanupResult.deletedCount}</div>
                  {cleanupResult.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="font-semibold text-orange-600">Fehler:</div>
                      <ul className="list-disc list-inside">
                        {cleanupResult.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {orphanedData && (
              <div className="space-y-6">
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Verwaiste Ordner</div>
                    <div className="stat-value text-error">{orphanedData.totalOrphaned}</div>
                    <div className="stat-desc">Ordner ohne entsprechenden Inhalt</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">Gültige Inhalte</div>
                    <div className="stat-value text-success">{orphanedData.validSlugs.length}</div>
                    <div className="stat-desc">Aktive H5P-Inhalte in der DB</div>
                  </div>
                </div>

                {orphanedData.totalOrphaned > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-800 mb-3">
                      Verwaiste H5P-Ordner ({orphanedData.totalOrphaned})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                      {orphanedData.orphanedFolders.map((folder, index) => (
                        <div key={index} className="bg-white p-2 rounded border text-sm">
                          <code>/public/h5p/{folder}</code>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={cleanupOrphanedFiles}
                      disabled={isCleaningUp}
                      className="btn btn-error"
                    >
                      {isCleaningUp ? "Lösche..." : `${orphanedData.totalOrphaned} Ordner löschen`}
                    </button>
                  </div>
                )}

                {orphanedData.totalOrphaned === 0 && (
                  <div className="alert alert-success">
                    <span>🎉 Keine verwaisten H5P-Dateien gefunden! Alles ist sauber.</span>
                  </div>
                )}

                <div className="collapse collapse-arrow bg-base-200">
                  <input type="checkbox" aria-label="Gültige H5P-Inhalte anzeigen" />
                  <div className="collapse-title text-xl font-medium">
                    Gültige H5P-Inhalte anzeigen ({orphanedData.validSlugs.length})
                  </div>
                  <div className="collapse-content">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {orphanedData.validSlugs.map((slug, index) => (
                        <div key={index} className="bg-white p-2 rounded border text-sm">
                          <code>/public/h5p/{slug}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
