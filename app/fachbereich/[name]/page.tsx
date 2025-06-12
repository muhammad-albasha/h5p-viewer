'use client'
import React, { useEffect, useState, useMemo } from 'react'
import Navbar from '@/app/components/layout/Navbar'
import Header from '@/app/components/layout/Header'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PlayH5p from '@/app/components/PlayH5p'
import ContentFilter from '@/app/components/content/ContentFilter'
import FavoriteButton from '@/app/components/common/FavoriteButton'

interface SubjectAreaContent {
  id: number;
  name: string;
  subject_area: {
    id: number;
    name: string;
    slug: string;
  };
  path: string;
  type: string;
  tags: string[];
  slug?: string;
  coverImagePath?: string;
}

const Fachbereich = () => {
  const params = useParams();
  const router = useRouter();
  const subjectAreaSlug = params.name as string;
    const [content, setContent] = useState<SubjectAreaContent[]>([]);
  const [subjectAreaName, setSubjectAreaName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<SubjectAreaContent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view'>('list');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/h5p-content');
        
        if (!response.ok) {
          throw new Error("Inhalte konnten nicht geladen werden");
        }
        
        const allContent = await response.json();
        
        // Filter content by subject area slug
        const filteredContent = allContent.filter((item: SubjectAreaContent) => 
          item.subject_area && item.subject_area.slug === subjectAreaSlug
        );
        
        // Get subject area name from the first content item
        if (filteredContent.length > 0) {
          setSubjectAreaName(filteredContent[0].subject_area.name);
        }
        
        setContent(filteredContent);
      } catch (err: any) {
        setError(err.message || "Ein Fehler ist aufgetreten");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [subjectAreaSlug]);

  const handleContentSelect = (item: SubjectAreaContent) => {
    setSelectedContent(item);
    setViewMode('view');
  };
  const handleBackToList = () => {
    setSelectedContent(null);
    setViewMode('list');
  };

  // Get available tags from content
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    content.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [content]);

  // Filter content based on search and tags
  const filteredContent = useMemo(() => {
    return content.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(selectedTag => item.tags.includes(selectedTag));

      return matchesSearch && matchesTags;
    });
  }, [content, searchQuery, selectedTags]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  return (
    <>
      <Navbar />
      <Header />      
      {viewMode === 'list' && (
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
                  <Link 
                    href="/fachbereich"
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-white/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </Link>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    {subjectAreaName || "Fachbereich"}
                  </h1>
                </div>
                <p className="text-blue-100 text-lg max-w-2xl">
                  H5P-Lerninhalte für diesen Fachbereich entdecken
                </p>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2 text-blue-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-sm font-medium">{content.length} Inhalte</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-100">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium">{availableTags.length} Tags</span>
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
                  href="/fachbereich"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Alle Bereiche
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className={`${viewMode === 'view' ? 'w-full px-4' : 'container mx-auto max-w-6xl px-4'} space-y-8`}>
          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4 font-medium">Inhalte werden geladen...</p>
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
          ) : viewMode === 'list' && content.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg">Keine Inhalte gefunden</p>
                <p className="text-gray-500 text-sm mt-1">Für diesen Fachbereich sind noch keine H5P-Inhalte verfügbar.</p>
                <Link 
                  href="/fachbereich"
                  className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Zu allen Bereichen
                </Link>
              </div>
            </div>
          ) : viewMode === 'view' && selectedContent ? (
            <>
              {/* Enhanced Header for View Mode */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl -mx-4 -mt-12 mb-8">
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-48 -translate-y-48 backdrop-blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 backdrop-blur-3xl"></div>
                </div>
                
                <div className="relative container mx-auto max-w-6xl px-4 py-16">
                  {/* Breadcrumb Navigation */}
                  <nav className="flex items-center space-x-2 text-sm mb-8 text-blue-100">
                    <Link href="/" className="hover:text-white transition-colors">Startseite</Link>
                    <span>•</span>
                    <Link href="/fachbereich" className="hover:text-white transition-colors">Bereiche</Link>
                    <span>•</span>
                    <button onClick={handleBackToList} className="hover:text-white transition-colors">{subjectAreaName}</button>
                    <span>•</span>
                    <span className="text-white font-medium">{selectedContent.name}</span>
                  </nav>

                  <div className="grid lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 space-y-6 text-white">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
                          {selectedContent.type}
                        </span>
                      </div>

                      <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                        {selectedContent.name}
                      </h1>
                      
                      <p className="text-blue-100 text-xl leading-relaxed max-w-2xl">
                        Interaktiver {selectedContent.type}-Inhalt für optimales Lernen
                      </p>

                      {/* Tags */}
                      {selectedContent.tags && selectedContent.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedContent.tags.map((tag, idx) => (
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
                      <button
                        onClick={handleBackToList}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Zurück zur Übersicht
                      </button>
                        <div className="grid grid-cols-2 gap-2">
                        <FavoriteButton 
                          content={selectedContent} 
                          variant="header" 
                          showText={true}
                        />
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-200 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                          Teilen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H5P Content Player */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
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
                </div>
                
                <div className="p-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <PlayH5p h5pJsonPath={selectedContent.path} />
                  </div>
                </div>
              </div>
            </>) : viewMode === 'list' && (
            <>
              {/* Content Filter */}
              <ContentFilter
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedTags={selectedTags}
                availableTags={availableTags}
                toggleTag={toggleTag}
              />

              {/* Results Summary */}
              {(searchQuery || selectedTags.length > 0) && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Suchergebnisse</h3>
                      <p className="text-gray-600">
                        {filteredContent.length} von {content.length} Inhalten gefunden
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {searchQuery && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Suche: "{searchQuery}"
                          </span>
                        )}
                        {selectedTags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTags([]);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Filter zurücksetzen
                    </button>
                  </div>
                </div>
              )}

              {/* No results message */}
              {filteredContent.length === 0 && content.length > 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                  <div className="flex flex-col items-center justify-center p-12">
                    <div className="p-4 bg-yellow-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 font-medium text-lg">Keine passenden Inhalte</p>
                    <p className="text-gray-500 text-sm mt-1">Keine Inhalte entsprechen den aktuellen Filterkriterien.</p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTags([]);
                      }}
                      className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                </div>
              ) : (
                /* Content Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContent.map(item => {
                    // ...existing code...
                    let imageUrl = item.coverImagePath;
                    
                    if (!imageUrl) {
                      if (item.slug) {
                        imageUrl = `/api/h5p/cover/${item.slug}/content/images/cover.jpg`;
                      } else {
                        let pathSlug = item.path;
                        if (pathSlug.startsWith('/h5p/')) {
                          pathSlug = pathSlug.replace('/h5p/', '');
                        }
                        pathSlug = pathSlug.replace(/^\/?h5p\/?/, '').replace(/\/+$/, '');
                        imageUrl = `/api/h5p/cover/${pathSlug}/content/images/cover.jpg`;
                      }
                    }

                    return (
                      <div
                        key={item.id}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-white/20 transition-all duration-300 hover:scale-105 group cursor-pointer"
                        onClick={() => handleContentSelect(item)}
                      >
                        {/* Card Image */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/assets/placeholder-image.svg';
                            }}
                          />                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium backdrop-blur-sm">
                              {item.type}
                            </span>
                          </div>
                          <div className="absolute top-3 left-3">
                            <FavoriteButton content={item} variant="card" />
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          {/* Subject Area Badge */}
                          {item.subject_area && (
                            <div className="flex justify-start">
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium">
                                {item.subject_area.name}
                              </span>
                            </div>
                          )}

                          {/* Title */}
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {item.name}
                          </h3>

                          {/* Description */}
                          <p className="text-gray-600 text-sm leading-relaxed">
                            Interaktiver {item.type}-Inhalt für optimales Lernen
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {item.tags?.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                              >
                                {tag}
                              </span>
                            ))}
                            {item.tags && item.tags.length > 3 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                +{item.tags.length - 3} weitere
                              </span>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-4 border-t border-gray-100">
                            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Jetzt starten
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Fachbereich