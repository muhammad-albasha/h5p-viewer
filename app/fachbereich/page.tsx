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

  const totalContent = Object.values(contentCounts).reduce((sum, count) => sum + count, 0);
  return (
    <>
      <Navbar />
      <Header />

      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-white relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] opacity-50"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 container mx-auto max-w-7xl px-4 py-20">
          {/* Navigation Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8 opacity-90">
            <Link href="/" className="hover:text-accent transition-colors">
              <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Startseite
            </Link>
            <span className="opacity-60">•</span>
            <span className="text-accent font-medium">Fachbereiche</span>
          </nav>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Content Info */}
            <div className="lg:col-span-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                  <span className="badge badge-accent badge-lg font-semibold px-4 py-2">
                    Fachbereiche
                  </span>
                </div>

                <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                  Entdecken Sie unsere
                  <span className="block text-accent">Fachbereiche</span>
                </h1>
                
                <p className="text-xl lg:text-2xl opacity-90 leading-relaxed max-w-2xl">
                  Durchsuchen Sie H5P-Inhalte nach Fachbereichen organisiert für ein besseres Lernerlebnis
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="lg:col-span-4">
              <div className="stats bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white shadow-2xl">
                <div className="stat">
                  <div className="stat-title text-white/70">Verfügbare Fachbereiche</div>
                  <div className="stat-value text-3xl">
                    {isLoading ? "..." : subjectAreas.length}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title text-white/70">Gesamte Inhalte</div>
                  <div className="stat-value text-3xl">
                    {isLoading ? "..." : totalContent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Main Content */}
      <div className="bg-base-200 min-h-screen py-16">
        <div className="container mx-auto max-w-7xl px-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 right-0 bottom-0 left-0 m-auto w-16 h-16">
                  <div className="absolute w-full h-full rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-4 border-t-secondary border-r-transparent border-b-transparent border-l-transparent animate-spin-slow"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="font-medium text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Fachbereiche werden geladen
                </p>
                <p className="text-sm text-base-content/60">Bitte haben Sie einen Moment Geduld</p>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-error shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          ) : subjectAreas.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-base-100 rounded-2xl p-12 shadow-xl border border-base-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Keine Fachbereiche gefunden</h3>
                <p className="text-base-content/70 mb-4">Es wurden noch keine Fachbereiche angelegt.</p>
                <Link href="/admin/subject-areas" className="btn btn-primary">
                  Fachbereiche verwalten
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Wählen Sie einen Fachbereich</h2>
                <p className="text-base-content/70 max-w-2xl mx-auto">
                  Entdecken Sie interaktive H5P-Lerninhalte, organisiert nach Fachbereichen für eine optimale Lernerfahrung.
                </p>
              </div>

              {/* Subject Areas Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                      <div className="relative bg-gradient-to-br from-base-100 to-base-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:scale-105 border border-base-300/50 overflow-hidden">
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                        
                        {/* Color indicator */}
                        <div className="relative p-6 space-y-4">

                          <div className="space-y-2">
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                              {area.name}
                            </h3>
                            <p className="text-base-content/70 text-sm leading-relaxed">
                              Entdecken Sie alle verfügbaren H5P-Inhalte in diesem Fachbereich
                            </p>
                            
                          </div>

                          {/* Action area */}
                          <div className="pt-4 border-t border-base-300/30">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-base-content/50 font-medium">
                                {contentCount === 0 ? 'Noch keine Inhalte' : 
                                 contentCount === 1 ? '1 Inhalt verfügbar' : 
                                 `${contentCount} Inhalte verfügbar`}
                              </span>
                              <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform duration-300">
                                <span className="text-sm font-medium mr-1">Erkunden</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default FachbereichOverview;
