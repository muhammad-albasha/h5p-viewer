"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PlayH5p from "@/app/components/PlayH5p";
import { FiArrowLeft } from "react-icons/fi";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

interface H5PContentDetails {
  id?: string;
  name: string;
  path: string;
  type: string;
  tags: string[];
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

        const contents = await response.json();

        // We look for content with the corresponding ID
        const contentIndex = parseInt(id) - 1; // ID starts at 1, array at 0
        const content =
          contents[contentIndex] ||
          contents.find((item: H5PContentDetails) => item.id === id);

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
  }, [id]);
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] opacity-50"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 py-16">
          {/* Navigation Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8 opacity-90">
            <Link href="/" className="hover:text-accent transition-colors">
              <svg
                className="w-4 h-4 mr-1 inline"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Startseite
            </Link>
            <span className="opacity-60">•</span>
            <Link href="/h5p" className="hover:text-accent transition-colors">
              H5P Inhalte
            </Link>
            <span className="opacity-60">•</span>
            <span className="text-accent font-medium">
              {loading ? "Laden..." : contentDetails?.name || "Content"}
            </span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Content Info */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {!loading && contentDetails && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                      <span className="badge badge-accent badge-lg font-semibold px-4 py-2">
                        {contentDetails.type}
                      </span>
                    </div>
                  )}
                </div>

                <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-12 bg-white/20 rounded-lg animate-pulse w-96"></div>
                      <div className="h-12 bg-white/20 rounded-lg animate-pulse w-64"></div>
                    </div>
                  ) : (
                    contentDetails?.name || "H5P Inhalt"
                  )}
                </h1>

                <p className="text-xl lg:text-2xl opacity-90 leading-relaxed max-w-2xl">
                  Interaktives Lernmaterial für ein besseres Lernerlebnis
                </p>
              </div>

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
            </div>{" "}
            {/* Action Buttons */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              {/* Main Action Buttons Group */}
              <div className="flex flex-col gap-3">
                <Link
                  href="/h5p"
                  className="btn btn-outline btn-white border-2 hover:bg-white hover:text-primary transition-all duration-300 group"
                >
                  <svg
                    className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    />
                  </svg>
                  Zurück zur Übersicht
                </Link>

                <div className="flex gap-2">
                  <button className="btn btn-outline btn-white/80 border-white/50 hover:bg-white/20 hover:border-white transition-all duration-200 flex-1">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    Favoriten
                  </button>
                  <button className="btn btn-outline btn-white/80 border-white/50 hover:bg-white/20 hover:border-white transition-all duration-200 flex-1">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    Teilen
                  </button>
                </div>
              </div>

              {!loading && contentDetails && (
                <div className="stats bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white">
                  <div className="stat">
                    <div className="stat-title text-white/70">Content-Typ</div>
                    <div className="stat-value text-lg">
                      {contentDetails.type}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Main Content */}
      <main className="bg-base-100 relative">
        <div className="w-full px-4 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-8">
              {" "}
              {/* Enhanced Loading Animation */}
              <div className="relative">
                <div className="w-24 h-24 border-4 border-primary/30 rounded-full"></div>
                <div className="absolute top-0 left-0 w-24 h-24 border-4 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute top-2 left-2 w-20 h-20 border-4 border-t-secondary rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                <div className="absolute top-4 left-4 w-16 h-16 border-4 border-t-accent rounded-full animate-[spin_2s_linear_infinite]"></div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Inhalte werden geladen
                </h2>
                <p className="text-base-content/70">Einen Moment bitte...</p>
              </div>
            </div>
          ) : error ? (
            <div className="max-w-2xl mx-auto">
              <div className="card bg-base-100 shadow-2xl border border-error/20">
                <div className="card-body p-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-error/10 p-4 rounded-full">
                      <svg
                        className="w-8 h-8 text-error"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 text-error">
                        Es ist ein Fehler aufgetreten
                      </h3>
                      <p className="text-base-content/80 mb-6 leading-relaxed">
                        {error}
                      </p>
                      <div className="flex gap-3">
                        <Link href="/h5p" className="btn btn-primary">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            />
                          </svg>
                          Zurück zur Übersicht
                        </Link>
                        <button
                          onClick={() => window.location.reload()}
                          className="btn btn-outline"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Erneut versuchen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : contentDetails ? (
            <div className="space-y-8">
              {/* H5P Content Player */}
              <div className="card bg-base-100 shadow-2xl border border-base-300/50 overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 border-b border-base-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                    <h3 className="text-2xl font-bold">
                      Interaktiver Lerninhalt
                    </h3>
                  </div>
                </div>                <div className="p-1">
                  <div className="bg-base-200/50 rounded-xl p-2 border-base-300">
                    <PlayH5p h5pJsonPath={contentDetails.path} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center py-24">
              <div className="card bg-base-100 shadow-2xl">
                <div className="card-body p-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-warning/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-warning"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-bold mb-4">
                    Keine Inhalte gefunden
                  </h3>
                  <p className="text-base-content/70 mb-8 text-lg leading-relaxed">
                    Leider konnten wir keinen passenden H5P-Inhalt finden.
                    Möglicherweise wurde der Inhalt verschoben oder ist nicht
                    mehr verfügbar.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/h5p" className="btn btn-primary btn-lg">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        />
                      </svg>
                      Alle Inhalte anzeigen
                    </Link>
                    <Link href="/" className="btn btn-outline btn-lg">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Zur Startseite
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="bg-gradient-to-br from-secondary to-accent text-accent-content py-12 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots pattern-opacity-10 pattern-white pattern-size-2"></div>
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              H5P Inhalt
            </h1>
            <p className="text-accent-content/80 text-lg">
              Interaktives Lernmaterial
            </p>
          </div>
          <Link
            href="/"
            className="btn btn-accent btn-outline hover:btn-primary transition-all duration-300 px-6"
          >
            <FiArrowLeft size={16} className="mr-2" />
            Zurück zur Übersicht
          </Link>
        </div>
      </div>

      <main className="bg-base-200 container mx-auto max-w-6xl py-12 px-4 -mt-8">
        <div className="flex flex-col items-center justify-center my-24 space-y-6">
          <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-secondary border-r-transparent border-b-transparent border-l-transparent animate-spin-slow"></div>
            <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin-slower"></div>
          </div>
          <p className="text-xl font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Inhalte werden geladen...
          </p>
        </div>
      </main>
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

      <footer className="bg-gradient-to-br from-neutral to-neutral-focus text-neutral-content mt-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-12 px-4">
            <div className="md:col-span-4 space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">H5P-Viewer</h2>
              <p className="opacity-80 leading-relaxed">
                Eine moderne Plattform für interaktive Lernmaterialien, die das
                Lernerlebnis durch ansprechende Inhalte verbessert.
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-3">Links</h3>
              <ul className="space-y-2">
                <li>
                  <a className="hover:text-primary transition-colors duration-200">
                    Startseite
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors duration-200">
                    Kurse
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors duration-200">
                    Materialien
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-3">Hilfe</h3>
              <ul className="space-y-2">
                <li>
                  <a className="hover:text-primary transition-colors duration-200">
                    FAQ
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors duration-200">
                    Support
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors duration-200">
                    Kontakt
                  </a>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h3 className="font-semibold text-lg mb-3">Newsletter</h3>
              <p className="opacity-80 mb-4">
                Bleiben Sie auf dem Laufenden über neue Lernmaterialien
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="E-Mail Adresse"
                  className="input input-bordered w-full max-w-xs rounded-r-none"
                />
                <button className="btn btn-primary rounded-l-none">
                  Abonnieren
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-content/10 py-6 px-4 md:flex items-center justify-between text-sm opacity-70">
            <p>
              © {new Date().getFullYear()} H5P-Viewer. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a className="hover:text-primary transition-colors duration-200">
                Datenschutz
              </a>
              <a className="hover:text-primary transition-colors duration-200">
                Impressum
              </a>
              <a className="hover:text-primary transition-colors duration-200">
                AGB
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
