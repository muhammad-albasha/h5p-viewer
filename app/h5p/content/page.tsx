"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PlayH5p from "@/app/components/PlayH5p";
import { FiArrowLeft } from "react-icons/fi";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import FavoriteButton from "@/app/components/common/FavoriteButton";

interface H5PContentDetails {
  id: number;
  name: string;
  path: string;
  type: string;
  tags: string[];
  description?: string;
  subject_area?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  slug?: string;
  coverImagePath?: string;
}

// Separate component that uses useSearchParams
function H5PContentViewer() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [contentDetails, setContentDetails] =
    useState<H5PContentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContentDetails = async () => {
      try {
        setLoading(true);

        if (!id) {
          setError("Keine Content-ID angegeben.");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/h5p-content");
        if (!response.ok) {
          throw new Error("Failed to fetch H5P content");
        }

        const contents = await response.json();        // We look for content with the corresponding ID
        const contentIndex = parseInt(id) - 1; // ID starts at 1, array at 0
        const content =
          contents[contentIndex] ||
          contents.find((item: H5PContentDetails) => item.id.toString() === id);

        if (content) {
          setContentDetails(content);
        } else {
          setError(`Content mit ID "${id}" nicht gefunden`);
        }
      } catch (error) {
        // Error fetching content details
        setError("Failed to load content details");
      } finally {
        setLoading(false);
      }
    };

    fetchContentDetails();
  }, [id]);  return (
    <>
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48 backdrop-blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 backdrop-blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32 backdrop-blur-2xl"></div>
        </div>
        
        <div className="relative container-fluid mx-auto  px-4 py-16">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm mb-8 text-blue-100">
            <Link href="/" className="hover:text-white transition-colors">Startseite</Link>
            <span>•</span>
            <Link href="/h5p" className="hover:text-white transition-colors">H5P Inhalte</Link>
            <span>•</span>
            <span className="text-white font-medium">
              {loading ? "Laden..." : contentDetails?.name || "Content"}
            </span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                {!loading && contentDetails && (
                  <span className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
                    {contentDetails.type}
                  </span>
                )}
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                {loading ? (
                  <div className="space-y-3">
                    <div className="h-12 bg-white/20 rounded-lg animate-pulse w-96"></div>
                    <div className="h-12 bg-white/20 rounded-lg animate-pulse w-64"></div>
                  </div>
                ) : (
                  contentDetails?.name || "H5P Inhalt"
                )}
              </h1>
              
              <p className="text-blue-100 text-xl leading-relaxed max-w-2xl">
                {!loading && contentDetails && contentDetails.description 
                  ? contentDetails.description
                  : !loading && contentDetails 
                  ? `Interaktiver ${contentDetails.type}-Inhalt für optimales Lernen`
                  : "Interaktives Lernmaterial für optimales Lernen"
                }
              </p>

              {/* Tags */}
              {!loading &&
                contentDetails?.tags &&
                contentDetails.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {contentDetails.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-all duration-200 border border-white/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <Link
                href="/h5p"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Zurück zur Übersicht
              </Link>
              
              <div className="grid grid-cols-2 gap-2">
                {!loading && contentDetails && (
                  <FavoriteButton 
                    content={contentDetails} 
                    variant="header" 
                    showText={true}
                  />
                )}
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-200 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Teilen
                </button>
              </div>
              
              {!loading && contentDetails && contentDetails.subject_area && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-blue-100 text-sm font-medium mb-1">Bereich</div>
                  <div className="text-white font-semibold">{contentDetails.subject_area.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="w-full px-4 space-y-8">{loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4 font-medium">Inhalte werden geladen...</p>
                <p className="text-gray-500 text-sm mt-1">Bitte warten Sie einen Moment</p>
              </div>
            </div>          ) : error ? (
            <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium text-lg">Fehler beim Laden</p>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
                <div className="flex gap-3 mt-6">
                  <Link 
                    href="/h5p" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 hover:scale-105 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Zurück zur Übersicht
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 hover:scale-105 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Erneut versuchen
                  </button>
                </div>
              </div>
            </div>
          ) : contentDetails ? (            <div className="w-full space-y-8">
              {/* H5P Content Player */}
              <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20"><div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Interaktiver Lerninhalt</h2>
                      <p className="text-blue-100 text-sm mt-1">Starten Sie Ihre Lernerfahrung</p>
                    </div>
                  </div>
                </div>                  <div className="p-2">
                  <div className="bg-gray-50 rounded-xl p-2 border border-gray-200 w-full">
                    <PlayH5p h5pJsonPath={contentDetails.path} />
                  </div>
                </div>
              </div>
            </div>
          ) : (            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg">Keine Inhalte gefunden</p>
                <p className="text-gray-500 text-sm mt-1 mb-6">
                  Leider konnten wir keinen passenden H5P-Inhalt finden.
                  Möglicherweise wurde der Inhalt verschoben oder ist nicht mehr verfügbar.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link 
                    href="/h5p" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 hover:scale-105 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Alle Inhalte anzeigen
                  </Link>
                  <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 hover:scale-105 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Zur Startseite
                  </Link>
                </div>
              </div>
            </div>
          )}        </div>
      </div>
    </>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48 backdrop-blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 backdrop-blur-3xl"></div>
      </div>

      <div className="relative container-fluid mx-auto  px-4 py-16">
        <div className="text-white">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            H5P Inhalt
          </h1>
          <p className="text-blue-100 text-lg">
            Interaktives Lernmaterial wird geladen...
          </p>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="container-fluid mx-auto  px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4 font-medium">Inhalte werden geladen...</p>
              <p className="text-gray-500 text-sm mt-1">Bitte warten Sie einen Moment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function H5PContentPage() {
  return (
    <>
      <Navbar />
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <H5PContentViewer />
      </Suspense>
    </>
  );
}
