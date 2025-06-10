'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

interface LegalPageSettings {
  imprint: string;
  privacy: string;
  copyright: string;
}

export default function LegalPagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [legalSettings, setLegalSettings] = useState<LegalPageSettings>({
    imprint: '',
    privacy: '',
    copyright: ''
  });
  const [activeTab, setActiveTab] = useState<'imprint' | 'privacy' | 'copyright'>('imprint');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchLegalSettings();
    }
  }, [status]);

  const fetchLegalSettings = async () => {
    try {
      const response = await fetch('/api/admin/legal-pages');
      if (response.ok) {
        const data = await response.json();
        setLegalSettings(data);
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Laden der Seiteneinstellungen' });
      }
    } catch (error) {
      console.error('Error fetching legal settings:', error);
      setMessage({ type: 'error', text: 'Fehler beim Laden der Seiteneinstellungen' });
    } finally {
      setIsLoading(false);
    }
  };

  const saveLegalSettings = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/legal-pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(legalSettings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Rechtliche Seiten erfolgreich gespeichert!' });
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen' });
      }
    } catch (error) {
      console.error('Error saving legal settings:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof LegalPageSettings, value: string) => {
    setLegalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Rechtliche Seiten werden geladen...</p>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    { key: 'imprint' as const, label: 'Impressum', icon: '📋' },
    { key: 'privacy' as const, label: 'Datenschutz', icon: '🔒' },
    { key: 'copyright' as const, label: 'Urheberrecht', icon: '©️' }
  ];

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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Rechtliche Seiten
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Verwalten Sie die Inhalte für Impressum, Datenschutz und Urheberrecht
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/admin/pages"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Seiteneinstellungen
              </Link>
              <Link 
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Message */}
          {message && (
            <div className={`mb-8 p-4 rounded-xl border ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.type === 'success' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 mb-8">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">
                  {tabs.find(tab => tab.key === activeTab)?.label} bearbeiten
                </h2>
              </div>
              <p className="text-blue-100 mt-2 text-sm">
                Bearbeiten Sie den Inhalt für die {tabs.find(tab => tab.key === activeTab)?.label}-Seite
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {tabs.find(tab => tab.key === activeTab)?.label}-Inhalt
                  </label>
                  <textarea
                    className="w-full h-96 px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none font-mono text-sm"
                    value={legalSettings[activeTab]}
                    onChange={(e) => handleInputChange(activeTab, e.target.value)}
                    placeholder={`Geben Sie hier den Inhalt für die ${tabs.find(tab => tab.key === activeTab)?.label}-Seite ein...

Sie können HTML-Tags verwenden:
- <h1>, <h2>, <h3> für Überschriften
- <p> für Absätze
- <ul> und <li> für Listen
- <strong> für fetten Text
- <em> für kursiven Text
- <a href="..."> für Links
- <br> für Zeilenumbrüche`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveLegalSettings}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Wird gespeichert...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Alle Änderungen speichern
                      </>
                    )}
                  </button>
                  <button
                    onClick={fetchLegalSettings}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Zurücksetzen
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold">Vorschau</h2>
              </div>
              <p className="text-green-100 mt-2 text-sm">
                So wird Ihre {tabs.find(tab => tab.key === activeTab)?.label}-Seite aussehen
              </p>
            </div>
            
            <div className="p-6">
              <div className="prose max-w-none">
                {legalSettings[activeTab] ? (
                  <div 
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                    dangerouslySetInnerHTML={{ __html: legalSettings[activeTab] }}
                  />
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-gray-500 italic">
                    Kein Inhalt vorhanden. Fügen Sie oben Inhalt hinzu, um eine Vorschau zu sehen.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
