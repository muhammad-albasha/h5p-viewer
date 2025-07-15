"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import { withBasePath } from "@/app/utils/paths";

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  created: string;
  type: 'h5p' | 'other';
}

export default function UploadsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(withBasePath("/login"));
    }
  }, [status, router]);

  // Fetch uploaded files when component loads
  useEffect(() => {
    if (status === "authenticated") {
      fetchFiles();
    }
  }, [status]);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(withBasePath("/api/admin/uploads"));
      
      if (!response.ok) {
        throw new Error("Failed to fetch uploaded files");
      }
      
      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message || "Fehler beim Laden der Dateien");
      console.error("Error fetching files:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      const response = await fetch(withBasePath(`/api/admin/uploads/download?file=${encodeURIComponent(file.name)}`));
      
      if (!response.ok) {
        throw new Error("Download fehlgeschlagen");
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccessMessage(`Datei "${file.name}" wurde heruntergeladen`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Download fehlgeschlagen");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (deleteConfirm !== fileName) {
      setDeleteConfirm(fileName);
      return;
    }
    
    try {
      setIsDeleting(fileName);
      setError(null);
      
      const response = await fetch(withBasePath(`/api/admin/uploads/${encodeURIComponent(fileName)}`), {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Löschen fehlgeschlagen");
      }
      
      // Remove from local state
      setFiles(prev => prev.filter(file => file.name !== fileName));
      setSuccessMessage(`Datei "${fileName}" wurde erfolgreich gelöscht`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      setError(err.message || "Fehler beim Löschen der Datei");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Upload-Verwaltung
                </h1>
                <p className="text-gray-600">
                  Verwalten Sie hochgeladene .h5p-Dateien und andere Upload-Inhalte
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={fetchFiles}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Laden..." : "Aktualisieren"}
                </button>
                <Link 
                  href="/admin"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Zurück zum Dashboard
                </Link>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-700">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Files Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Hochgeladene Dateien ({files.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Lade Dateien...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg">Keine Dateien gefunden</p>
                <p className="text-gray-400 text-sm mt-1">Laden Sie Dateien über die Upload-Seite hoch</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dateiname
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Typ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Größe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Erstellt
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <tr key={file.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              {file.type === 'h5p' ? (
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {file.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            file.type === 'h5p' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {file.type === 'h5p' ? 'H5P' : 'Andere'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(file.created)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {/* Download Button */}
                            <button
                              onClick={() => handleDownload(file)}
                              className="inline-flex items-center px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                              title="Herunterladen"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(file.name)}
                              disabled={isDeleting === file.name}
                              className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                deleteConfirm === file.name
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              } disabled:opacity-50`}
                              title={deleteConfirm === file.name ? "Klicken Sie erneut zum Bestätigen" : "Löschen"}
                            >
                              {isDeleting === file.name ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"></div>
                                  Löschen...
                                </>
                              ) : deleteConfirm === file.name ? (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Bestätigen
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Löschen
                                </>
                              )}
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

          {/* Information Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Hinweise zur Upload-Verwaltung</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• .h5p-Dateien können heruntergeladen und gelöscht werden</li>
                  <li>• Das Löschen von Dateien ist unwiderruflich</li>
                  <li>• Stellen Sie sicher, dass keine wichtigen Inhalte gelöscht werden</li>
                  <li>• Dateien werden aus dem Upload-Verzeichnis entfernt</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
