'use client'
import React, { useEffect, useState, useMemo } from 'react'
import Navbar from '@/app/components/layout/Navbar'
import Header from '@/app/components/layout/Header'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PlayH5p from '@/app/components/PlayH5p'
import ContentFilter from '@/app/components/content/ContentFilter'

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
      
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-2 mb-4">            {viewMode === 'view' ? (
              <button 
                onClick={handleBackToList} 
                className="btn btn-sm btn-outline btn-circle"
                aria-label="Zurück zur Übersicht"
                title="Zurück zur Übersicht"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </button>
            ) : (
              <Link href="/fachbereich" className="btn btn-sm btn-outline btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {viewMode === 'view' ? selectedContent?.name : subjectAreaName || "Fachbereich"}
            </h1>
          </div>
          <p className="text-primary-content/80 mt-2">
            {viewMode === 'view' 
              ? 'Interaktiver H5P-Inhalt' 
              : 'H5P-Inhalte für diesen Fachbereich'
            }
          </p>
        </div>
      </div>
      
      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-6xl px-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          ) : viewMode === 'list' && content.length === 0 ? (
            <div className="alert alert-info">
              <p>Keine Inhalte für diesen Fachbereich gefunden</p>
            </div>
          ) : viewMode === 'view' && selectedContent ? (
            <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="px-4 py-1.5 rounded-full bg-secondary/20 text-secondary-content font-medium inline-block mb-3">
                      {selectedContent.type}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedContent.tags?.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary-content text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-y border-base-300 bg-base-100 flex items-center">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary to-secondary rounded-full mr-3"></div>
                <h2 className="text-xl font-bold">Interaktiver Lerninhalt</h2>
              </div>
              
              <div className="p-6">
                <div className="rounded-xl overflow-hidden shadow-lg border border-base-300">
                  <PlayH5p h5pJsonPath={selectedContent.path} />
                </div>
              </div>            </div>          ) : viewMode === 'list' && (
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
                <div className="mb-6 p-4 bg-base-100 rounded-lg shadow-sm border border-base-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-base-content/70">
                        {filteredContent.length} von {content.length} Inhalten gefunden
                      </p>
                      {searchQuery && (
                        <p className="text-sm text-primary font-medium">
                          Suche nach: "{searchQuery}"
                        </p>
                      )}
                      {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-sm text-base-content/70">Tags: </span>
                          {selectedTags.map(tag => (
                            <span key={tag} className="badge badge-primary badge-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTags([]);
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                </div>
              )}

              {/* No results message */}
              {filteredContent.length === 0 && content.length > 0 ? (
                <div className="alert alert-warning">
                  <p>Keine Inhalte entsprechen den aktuellen Filterkriterien.</p>
                </div>
              ) : (
                /* Content Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredContent.map(item => {
                // Determine image URL - prioritize coverImagePath from database
                let imageUrl = item.coverImagePath;
                
                // If no coverImagePath, construct from slug or path
                if (!imageUrl) {
                  if (item.slug) {
                    imageUrl = `/api/h5p/cover/${item.slug}/content/images/cover.jpg`;
                  } else {
                    // Fallback: construct from path
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
                    className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-base-300/50 overflow-hidden cursor-pointer"
                    onClick={() => handleContentSelect(item)}
                  >
                    {/* Card Image */}
                    <figure className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/assets/placeholder-image.svg';
                        }}
                      />
                      {/* Content type overlay */}
                      <div className="absolute top-3 right-3">
                        <div className="badge badge-primary badge-lg font-semibold px-3 py-2 shadow-lg bg-primary/90 backdrop-blur-sm">
                          {item.type}
                        </div>
                      </div>
                    </figure>

                    <div className="card-body p-6 space-y-4">
                      {/* Subject Area Badge */}
                      <div className="flex justify-start items-start">
                        {item.subject_area && (
                          <div className="badge badge-outline badge-sm border-2 font-medium">
                            {item.subject_area.name}
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="card-title text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-200">
                        {item.name}
                      </h3>

                      {/* Description Space */}
                      <p className="text-base-content/70 text-sm leading-relaxed min-h-[3rem] flex items-center">
                        Interaktiver {item.type}-Inhalt für ein besseres Lernerlebnis
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {item.tags?.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="badge bg-gradient-to-r from-secondary/80 to-secondary text-secondary-content border-0 shadow-sm font-medium px-3 py-1 text-xs hover:from-primary/80 hover:to-primary hover:text-primary-content transition-all duration-200 hover:shadow-md hover:scale-105"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags && item.tags.length > 3 && (
                          <span className="badge bg-gradient-to-r from-base-300 to-base-200 text-base-content border-0 shadow-sm font-medium px-3 py-1 text-xs">
                            +{item.tags.length - 3} weitere
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="card-actions justify-center pt-4 border-t border-base-300/30">
                        <button className="btn btn-primary btn-wide hover:btn-primary-focus group-hover:scale-105 transition-all duration-200 shadow-md font-semibold">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Jetzt starten
                        </button>
                      </div>
                    </div>
                  </div>                );
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