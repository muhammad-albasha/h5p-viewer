"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import PlayH5p from '@/app/components/PlayH5p';
import { FiArrowLeft } from 'react-icons/fi';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';

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
  const id = searchParams.get('id');
  
  const [contentDetails, setContentDetails] = useState<H5PContentDetails | null>(null);
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
        
        const response = await fetch('/api/h5p-content');
        if (!response.ok) {
          throw new Error('Failed to fetch H5P content');
        }
        
        const contents = await response.json();
        
        // We look for content with the corresponding ID
        const contentIndex = parseInt(id) - 1; // ID starts at 1, array at 0
        const content = contents[contentIndex] || contents.find((item: H5PContentDetails) => item.id === id);
        
        if (content) {
          setContentDetails(content);        } else {
          setError(`Content mit ID "${id}" nicht gefunden`);        }
      } catch (error) {
        // Error fetching content details
        setError('Failed to load content details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContentDetails();
  }, [id]);
  
  return (
    <div className="bg-gradient-to-br from-secondary to-accent text-accent-content py-12 relative overflow-hidden">
      <div className="absolute inset-0 pattern-dots pattern-opacity-10 pattern-white pattern-size-2"></div>
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              {contentDetails?.name || "H5P Inhalt"}
            </h1>
            <p className="text-accent-content/80 text-lg">Interaktives Lernmaterial</p>
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
        {loading ? (
          <div className="flex flex-col items-center justify-center my-24 space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute top-2 left-2 w-20 h-20 rounded-full border-4 border-t-secondary border-r-transparent border-b-transparent border-l-transparent animate-spin-slow"></div>
              <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin-slower"></div>
            </div>
            <p className="text-xl font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Inhalte werden geladen...</p>
          </div>
        ) : error ? (
          <div className="max-w-xl mx-auto mt-12">
            <div className="bg-base-100 rounded-xl shadow-xl p-8 border-l-4 border-error">
              <div className="flex gap-4 items-start">
                <div className="bg-error/10 p-3 rounded-full text-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Es ist ein Fehler aufgetreten</h3>
                  <p className="text-base-content/70 mb-6">{error}</p>
                  <Link href="/" className="btn btn-primary btn-md">
                    <FiArrowLeft className="mr-2" /> Zurück zur Übersicht
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : contentDetails ? (
          <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="px-4 py-1.5 rounded-full bg-secondary/20 text-secondary-content font-medium inline-block mb-3">
                    {contentDetails.type}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {contentDetails.tags?.map((tag, idx) => (
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
                <PlayH5p h5pJsonPath={contentDetails.path} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto mt-12">
            <div className="bg-base-100 rounded-xl shadow-xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-warning/20 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4M8 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Keine Inhalte gefunden</h3>
              <p className="text-base-content/70 mb-6">
                Leider konnten wir keinen passenden H5P-Inhalt finden.
              </p>
              <Link href="/" className="btn btn-primary btn-lg">
                <FiArrowLeft className="mr-2" /> Zurück zur Übersicht
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
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
            <p className="text-accent-content/80 text-lg">Interaktives Lernmaterial</p>
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
          <p className="text-xl font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Inhalte werden geladen...</p>
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
              <p className="opacity-80 leading-relaxed">Eine moderne Plattform für interaktive Lernmaterialien, die das Lernerlebnis durch ansprechende Inhalte verbessert.</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-3">Links</h3>
              <ul className="space-y-2">
                <li><a className="hover:text-primary transition-colors duration-200">Startseite</a></li>
                <li><a className="hover:text-primary transition-colors duration-200">Kurse</a></li>
                <li><a className="hover:text-primary transition-colors duration-200">Materialien</a></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-3">Hilfe</h3>
              <ul className="space-y-2">
                <li><a className="hover:text-primary transition-colors duration-200">FAQ</a></li>
                <li><a className="hover:text-primary transition-colors duration-200">Support</a></li>
                <li><a className="hover:text-primary transition-colors duration-200">Kontakt</a></li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h3 className="font-semibold text-lg mb-3">Newsletter</h3>
              <p className="opacity-80 mb-4">Bleiben Sie auf dem Laufenden über neue Lernmaterialien</p>
              <div className="flex">
                <input type="email" placeholder="E-Mail Adresse" className="input input-bordered w-full max-w-xs rounded-r-none" />
                <button className="btn btn-primary rounded-l-none">
                  Abonnieren
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-content/10 py-6 px-4 md:flex items-center justify-between text-sm opacity-70">
            <p>© {new Date().getFullYear()} H5P-Viewer. Alle Rechte vorbehalten.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a className="hover:text-primary transition-colors duration-200">Datenschutz</a>
              <a className="hover:text-primary transition-colors duration-200">Impressum</a>
              <a className="hover:text-primary transition-colors duration-200">AGB</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
