"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';
import ContentFilter from '@/app/components/content/ContentFilter';
import ContentCardGrid from '@/app/components/content/ContentCardGrid';
import SortToggle from "@/app/components/content/SortToggle";
import { useFavorites } from '@/app/hooks/useFavorites';
import Link from 'next/link';
import { withBasePath } from '../utils/paths';

interface SubjectArea {
  id: number;
  name: string;
  slug: string;
}

interface H5PContent {
  id: number;
  name: string;
  path: string;
  type: string;
  tags: string[];
  slug?: string;
  isPasswordProtected?: boolean;
  subject_area?: SubjectArea | null;
  coverImagePath?: string;
}

function H5PContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { favorites } = useFavorites();
  const [content, setContent] = useState<H5PContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<H5PContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [selectedSubjectArea, setSelectedSubjectArea] = useState('');
  const [sortOption, setSortOption] = useState<"alphabetical" | "date">("alphabetical");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [paginatedContent, setPaginatedContent] = useState<H5PContent[]>([]);

  // Check if favorites parameter is in URL
  useEffect(() => {
    const favoritesParam = searchParams.get('favorites');
    setShowOnlyFavorites(favoritesParam === 'true');
  }, [searchParams]);
  
  // Fetch content and subject areas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch H5P content
        const contentResponse = await fetch(withBasePath('/api/h5p-content'));
        if (!contentResponse.ok) {
          throw new Error('Failed to fetch content');
        }
        const contentData = await contentResponse.json();
        setContent(contentData);
        
        // Extract all unique tags
        const allTags = new Set<string>();
        contentData.forEach((item: H5PContent) => {
          item.tags?.forEach(tag => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags));
        
        // Fetch subject areas
        const subjectAreaResponse = await fetch(withBasePath('/api/subject-areas'));
        if (!subjectAreaResponse.ok) {
          throw new Error('Failed to fetch subject areas');
        }
        const subjectAreaData = await subjectAreaResponse.json();
        setSubjectAreas(subjectAreaData);        
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        // Error occurred while fetching data
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
    // Filter content whenever filters change
  useEffect(() => {
    if (!content) return;
    
    let result = [...content];
    
    // Filter by favorites first if enabled
    if (showOnlyFavorites) {
      const favoriteIds = favorites.map(fav => fav.id);
      result = result.filter(item => favoriteIds.includes(item.id));
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      result = result.filter(item => 
        item.tags?.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Filter by subject area
    if (selectedSubjectArea) {
      result = result.filter(item => 
        item.subject_area && item.subject_area.slug === selectedSubjectArea
      );
    }
    
    // Sort results based on selected sort option
    if (sortOption === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "date") {
      // Sort by ID in reverse order (newer content has higher IDs)
      result.sort((a, b) => b.id - a.id);
    }
    
    setFilteredContent(result);
  }, [content, searchQuery, selectedTags, selectedSubjectArea, showOnlyFavorites, favorites, sortOption]);

  // Pagination logic - update paginated content when filtered content or page changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedContent(filteredContent.slice(startIndex, endIndex));
  }, [filteredContent, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTags, selectedSubjectArea, showOnlyFavorites]);

  // Calculate pagination info
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  // Pagination functions
  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
    return (
    <>
      <Navbar />
      <Header />
      
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-primary dark:bg-black">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className=""></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 backdrop-blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-32 -translate-y-32 backdrop-blur-2xl"></div>
        </div>
        
        <div className="relative container-responsive px-4 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {showOnlyFavorites ? (
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                </div>
                <h1 className="text-fluid-3xl md:text-fluid-4xl font-bold tracking-tight">
                  {showOnlyFavorites ? "Meine Favoriten" : "H5P-Inhalte"}
                </h1>
              </div>
              <p className="text-blue-100 text-fluid-base md:text-fluid-lg max-w-2xl leading-relaxed">
                {showOnlyFavorites 
                  ? "Ihre gespeicherten interaktiven Lerninhalte"
                  : "Entdecken Sie alle verfügbaren interaktiven Lerninhalte"
                }
              </p>
              <div className="flex flex-wrap items-center gap-4 lg:gap-6 mt-4 md:mt-6">
                <div className="flex items-center gap-2 text-blue-100">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-fluid-sm font-medium">
                    {showOnlyFavorites 
                      ? `${favorites.length} Favoriten` 
                      : `${content.length} Inhalte verfügbar`
                    }
                  </span>
                </div>
                {!showOnlyFavorites && (
                  <div className="flex items-center gap-2 text-blue-100">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-fluid-sm font-medium">{availableTags.length} Tags</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
              <button
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className={`responsive-btn inline-flex items-center justify-center gap-2 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20 ${
                  showOnlyFavorites 
                    ? 'bg-red-500/80 hover:bg-red-600/80 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <svg className="w-5 h-5" fill={showOnlyFavorites ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {showOnlyFavorites ? "Alle Inhalte" : "Nur Favoriten"}
              </button>
              <Link 
                href="/bereiche"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Bereiche
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-5">
        <div className="container-fluid mx-auto  px-4 space-y-8">
          
          {/* Content Filter */}
          <div>
            <ContentFilter 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedTags={selectedTags}
              availableTags={availableTags}
              toggleTag={toggleTag}
              subjectAreas={subjectAreas}
              selectedSubjectArea={selectedSubjectArea}
              setSelectedSubjectArea={setSelectedSubjectArea}
            />
            {/* Sorting below the filter */}
            <div className="mt-4 flex justify-end">
              <SortToggle sortOption={sortOption} setSortOption={setSortOption} />
            </div>
          </div>
          
          {/* Results Summary */}
          {(searchQuery || selectedTags.length > 0 || selectedSubjectArea) && (
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
                    {selectedSubjectArea && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {subjectAreas.find(area => area.slug === selectedSubjectArea)?.name}
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
                {(searchQuery || selectedTags.length > 0 || selectedSubjectArea) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTags([]);
                      setSelectedSubjectArea('');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Filter zurücksetzen
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Content Display */}
          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4 font-medium">H5P-Inhalte werden geladen...</p>
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
            </div>          ) : filteredContent.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  {showOnlyFavorites ? (
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-600 font-medium text-lg">
                  {showOnlyFavorites ? "Keine Favoriten gefunden" : "Keine Inhalte gefunden"}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {showOnlyFavorites 
                    ? favorites.length === 0 
                      ? "Sie haben noch keine Favoriten gespeichert. Klicken Sie auf das Herz-Symbol bei jedem Inhalt."
                      : "Keine Favoriten entsprechen den aktuellen Filterkriterien."
                    : (searchQuery || selectedTags.length > 0 || selectedSubjectArea) 
                      ? "Bitte ändern Sie die Filter oder versuchen Sie eine andere Suche."
                      : "Es sind aktuell keine H5P-Inhalte verfügbar."
                  }
                </p>
                {(searchQuery || selectedTags.length > 0 || selectedSubjectArea) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTags([]);
                      setSelectedSubjectArea('');
                    }}
                    className="mt-4 px-6 py-2 bg-primary hover: text-white rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    Alle Inhalte anzeigen
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Zeigt <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> bis{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredContent.length)}</span>{' '}
                    von <span className="font-medium">{filteredContent.length}</span> Ergebnissen
                  </div>
                  <div className="text-sm text-gray-500">
                    Seite {currentPage} von {totalPages}
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <ContentCardGrid 
                contents={paginatedContent}
                loading={false}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Previous button */}
                    <button
                      onClick={goToPrevPage}
                      disabled={!hasPrevPage}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        hasPrevPage 
                          ? 'bg-primary hover:bg-primary/80 text-white hover:scale-105 shadow-md' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Vorherige
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={goToNextPage}
                      disabled={!hasNextPage}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        hasNextPage 
                          ? 'bg-primary hover:bg-primary/80 text-white hover:scale-105 shadow-md' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Nächste
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}        </div>
      </div>
    </>
  );
}

export default function AllH5PContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-5">
        <div className="container-fluid mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="flex flex-col items-center justify-center p-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4 font-medium">Inhalte werden geladen...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <H5PContentPage />
    </Suspense>
  );
}