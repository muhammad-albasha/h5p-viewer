'use client'
import React, { useEffect, useState } from 'react'
import Navbar from '@/app/components/layout/Navbar'
import Header from '@/app/components/layout/Header'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PlayH5p from '@/app/components/PlayH5p'

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
              </div>
            </div>
          ) : viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.map(item => (
                <div 
                  key={item.id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                  onClick={() => handleContentSelect(item)}
                >
                  <div className="card-body">
                    <h2 className="card-title">{item.name}</h2>
                    <p>Typ: {item.type || "Unbekannt"}</p>
                    <div className="flex flex-wrap gap-1 mt-2 mb-2">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="badge badge-primary">{tag}</span>
                      ))}
                    </div>
                    <div className="card-actions justify-end">
                      <button className="btn btn-primary">Anzeigen</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Fachbereich