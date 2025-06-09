"use client";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import Link from "next/link";

interface SubjectArea {
  id: number;
  name: string;
  slug: string;
  color?: string;
  contentCount?: number;
}

const FachbereichOverview = () => {
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjectAreas = async () => {
      try {
        setIsLoading(true);
        
        // Fetch subject areas
        const response = await fetch("/api/admin/subject-areas");
        if (!response.ok) {
          throw new Error("Fachbereiche konnten nicht geladen werden");
        }
        const areas = await response.json();
        
        // Fetch all content to count by subject area
        const contentResponse = await fetch("/api/h5p-content");
        if (contentResponse.ok) {
          const allContent = await contentResponse.json();
          const counts: Record<string, number> = {};
          
          allContent.forEach((item: any) => {
            if (item.subject_area?.slug) {
              counts[item.subject_area.slug] = (counts[item.subject_area.slug] || 0) + 1;
            }
          });
          
          setContentCounts(counts);
        }
        
        setSubjectAreas(areas);
      } catch (err: any) {
        setError(err.message || "Ein Fehler ist aufgetreten");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectAreas();
  }, []);

  const totalContent = Object.values(contentCounts).reduce((sum, count) => sum + count, 0);  return (
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
        
        <div className="relative container mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Fachbereiche
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Entdecken Sie H5P-Lerninhalte organisiert nach Fachbereichen für optimales Lernen
              </p>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-blue-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm font-medium">{subjectAreas.length} Fachbereiche</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-medium">{totalContent} Lerninhalte</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/h5p"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Alle Inhalte
              </Link>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4 font-medium">Fachbereiche werden geladen...</p>
                <p className="text-gray-500 text-sm mt-1">Bitte warten Sie einen Moment</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium text-lg">Fehler beim Laden</p>
                <p className="text-gray-600 text-sm mt-1">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Seite neu laden
                </button>
              </div>
            </div>
          ) : subjectAreas.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg">Keine Fachbereiche gefunden</p>
                <p className="text-gray-500 text-sm mt-1">Es wurden noch keine Fachbereiche angelegt.</p>
                <Link 
                  href="/admin/subject-areas"
                  className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Fachbereiche verwalten
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Section Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 p-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Verfügbare Fachbereiche</h2>
                  <p className="text-gray-600">
                    Wählen Sie einen Fachbereich, um die verfügbaren H5P-Lerninhalte zu entdecken
                  </p>
                </div>
              </div>

              {/* Subject Areas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectAreas.map((area, index) => {
                  const contentCount = contentCounts[area.slug] || 0;
                  const colors = [
                    'from-blue-500 to-purple-600',
                    'from-green-500 to-teal-600',
                    'from-orange-500 to-red-600',
                    'from-pink-500 to-rose-600',
                    'from-indigo-500 to-blue-600',
                    'from-purple-500 to-pink-600',
                    'from-teal-500 to-green-600',
                    'from-red-500 to-orange-600'
                  ];
                  const gradientClass = colors[index % colors.length];

                  return (
                    <Link
                      key={area.id}
                      href={`/fachbereich/${area.slug}`}
                      className="group block"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-white/20 transition-all duration-300 hover:scale-105 group">
                        {/* Gradient Header */}
                        <div className={`h-2 bg-gradient-to-r ${gradientClass}`}></div>
                        
                        <div className="p-6">
                          {/* Icon and Title */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`p-3 bg-gradient-to-r ${gradientClass} rounded-xl text-white`}>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {area.name}
                            </h3>
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            Entdecken Sie alle verfügbaren H5P-Lerninhalte in diesem Fachbereich
                          </p>

                          {/* Statistics */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span>
                                {contentCount === 0 ? 'Noch keine Inhalte' : 
                                 contentCount === 1 ? '1 Inhalt' : 
                                 `${contentCount} Inhalte`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                              <span>Erkunden</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FachbereichOverview;
