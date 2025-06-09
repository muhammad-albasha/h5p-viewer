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
      {viewMode === 'list' && (
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/fachbereich" className="btn btn-sm btn-outline btn-circle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </Link>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                {subjectAreaName || "Fachbereich"}
              </h1>
            </div>
            <p className="text-primary-content/80 mt-2">
              H5P-Inhalte für diesen Fachbereich
            </p>
          </div>
        </div>
      )}
        <div className="bg-base-200 min-h-screen py-10">
        <div className={`${viewMode === 'view' ? 'w-full px-4' : 'container mx-auto max-w-6xl px-4'}`}>
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
            </div>          ) : viewMode === 'view' && selectedContent ? (
            <>
              {/* Enhanced Hero Section for Viewer Mode */}
              <div className="bg-gradient-to-br from-primary via-secondary to-accent text-white relative overflow-hidden -mt-10 -mx-4 mb-8">
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
                    <Link href="/fachbereich" className="hover:text-accent transition-colors">
                      Fachbereiche
                    </Link>
                    <span className="opacity-60">•</span>
                    <button onClick={handleBackToList} className="hover:text-accent transition-colors">
                      {subjectAreaName}
                    </button>
                    <span className="opacity-60">•</span>
                    <span className="text-accent font-medium">
                      {selectedContent.name}
                    </span>
                  </nav>

                  <div className="grid lg:grid-cols-12 gap-8 items-center">
                    {/* Content Info */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                            <span className="badge badge-accent badge-lg font-semibold px-4 py-2">
                              {selectedContent.type}
                            </span>
                          </div>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight">
                          {selectedContent.name}
                        </h1>
                        
                        <p className="text-xl lg:text-2xl opacity-90 leading-relaxed max-w-2xl">
                          {`Interaktiver ${selectedContent.type}-Inhalt für ein besseres Lernerlebnis`}
                        </p>
                      </div>

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

                    {/* Action Buttons */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                      {/* Main Action Buttons Group */}
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={handleBackToList}
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
                        </button>

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

                      <div className="stats bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white">
                        <div className="stat">
                          <div className="stat-title text-white/70">Content-Typ</div>
                          <div className="stat-value text-lg">
                            {selectedContent.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>              {/* Main Content */}
              <div className="w-full">
                {/* H5P Content Player */}
                <div className="bg-base-100 shadow-2xl border border-base-300/50 overflow-hidden rounded-xl">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 border-b border-base-300">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-full"></div>
                      <h3 className="text-2xl font-bold">
                        Interaktiver Lerninhalt
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-1">
                    <div className="bg-base-200/50 rounded-xl p-2 border-base-300">
                      <PlayH5p h5pJsonPath={selectedContent.path} />
                    </div>
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