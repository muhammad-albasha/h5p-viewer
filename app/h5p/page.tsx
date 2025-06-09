"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';
import ContentFilter from '@/app/components/content/ContentFilter';
import ContentCardGrid from '@/app/components/content/ContentCardGrid';
import Link from 'next/link';

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
  subject_area?: SubjectArea | null;
  coverImagePath?: string;
}

export default function AllH5PContent() {
  const router = useRouter();
  const [content, setContent] = useState<H5PContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<H5PContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [selectedSubjectArea, setSelectedSubjectArea] = useState('');
  
  // Fetch content and subject areas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch H5P content
        const contentResponse = await fetch('/api/h5p-content');
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
        const subjectAreaResponse = await fetch('/api/admin/subject-areas');
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
    
    setFilteredContent(result);
  }, [content, searchQuery, selectedTags, selectedSubjectArea]);
  
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
                  H5P-Inhalte
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Entdecken Sie alle verfügbaren interaktiven Lerninhalte
              </p>
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-blue-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm font-medium">{content.length} Inhalte verfügbar</span>
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
                href="/fachbereich"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Fachbereiche
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
        <div className="container mx-auto max-w-6xl px-4 space-y-8">
          
          {/* Content Filter */}
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
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg">Keine Inhalte gefunden</p>
                <p className="text-gray-500 text-sm mt-1">
                  {(searchQuery || selectedTags.length > 0 || selectedSubjectArea) 
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
                    className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    Alle Inhalte anzeigen
                  </button>
                )}
              </div>
            </div>
          ) : (
            <ContentCardGrid 
              contents={filteredContent}
              loading={isLoading}
            />
          )}
        </div>
      </div>
    </>
  );
}