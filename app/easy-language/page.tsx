"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';

export default function EasyLanguagePage() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/legal-page?type=easy_language');
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || '');
        }
      } catch (error) {
        console.error('Error fetching easy language content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <>
      <Navbar />
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 container-fluid mx-auto  px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Leichte Sprache
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Informationen in einfacher und verständlicher Sprache
            </p>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container-fluid mx-auto  px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : content ? (
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Noch kein Inhalt verfügbar</h3>
                  <p className="text-gray-600">Die Inhalte für die Leichte Sprache Seite werden gerade erstellt.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
