'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';

interface LegalPageData {
  page: string;
  content: string;
  title: string;
}

export default function PrivacyPage() {
  const [pageData, setPageData] = useState<LegalPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await fetch('/api/legal-page?page=privacy');
        if (response.ok) {
          const data = await response.json();
          setPageData(data);
        } else {
          setError('Fehler beim Laden des Seiteninhalts');
        }
      } catch (err) {
        setError('Fehler beim Laden des Seiteninhalts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageContent();
  }, []);

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Datenschutz
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Informationen zum Schutz Ihrer persönlichen Daten
              </p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4 font-medium">Inhalt wird geladen...</p>
              </div>
            ) : error ? (
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
                  className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Seite neu laden
                </button>
              </div>
            ) : pageData?.content ? (
              <div className="p-8">
                <div 
                  className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: pageData.content }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium text-lg">Kein Inhalt verfügbar</p>
                <p className="text-gray-500 text-sm mt-1">
                  Der Datenschutz-Inhalt wurde noch nicht erstellt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
