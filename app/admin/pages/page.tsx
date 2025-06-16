'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
}

interface LegalPageSettings {
  imprint: string;
  privacy: string;
  copyright: string;
}

export default function PageSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    title: '',
    subtitle: '',
    description: ''
  });
  const [legalSettings, setLegalSettings] = useState<LegalPageSettings>({
    imprint: '',
    privacy: '',
    copyright: ''
  });
  const [activeTab, setActiveTab] = useState<'hero' | 'legal'>('hero');
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
    fetchHeroSettings();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchHeroSettings();
    }
  }, [status]);  const fetchHeroSettings = async () => {
    try {
      const response = await fetch('/api/admin/pages');
      if (response.ok) {
        const data = await response.json();
        setHeroSettings(data.hero || { title: '', subtitle: '', description: '' });
        setLegalSettings(data.legal || { imprint: '', privacy: '', copyright: '' });
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Laden der Seiteneinstellungen' });
      }
    } catch (error) {
      console.error('Error fetching hero settings:', error);
      setMessage({ type: 'error', text: 'Fehler beim Laden der Seiteneinstellungen' });
    } finally {
      setIsLoading(false);
    }
  };
  const saveHeroSettings = async () => {
    if (!heroSettings.title.trim() || !heroSettings.subtitle.trim() || !heroSettings.description.trim()) {
      setMessage({ type: 'error', text: 'Bitte füllen Sie alle Felder aus' });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(heroSettings),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Seiteneinstellungen erfolgreich gespeichert!' });
      } else {
        setMessage({ type: 'error', text: 'Fehler beim Speichern der Seiteneinstellungen' });
      }
    } catch (error) {
      console.error('Error saving hero settings:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Seiteneinstellungen' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof HeroSettings, value: string) => {
    setHeroSettings(prev => ({
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
            <p className="text-gray-600 mt-4">Seiteneinstellungen werden geladen...</p>
          </div>
        </div>
      </>
    );
  }
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
        
        <div className="relative container-fluid mx-auto  px-4 py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Seiteneinstellungen
                </h1>
              </div>
              <p className="text-blue-100 text-lg max-w-2xl">
                Verwalten Sie die Inhalte Ihrer Website-Startseite
              </p>
            </div>
            <Link 
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12">
        <div className="container-fluid mx-auto  px-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hero Settings Form */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Hero-Bereich bearbeiten</h2>
                  </div>
                  <p className="text-blue-100 mt-2 text-sm">
                    Passen Sie den Hauptinhalt Ihrer Startseite an
                  </p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="title">
                      Titel
                    </label>
                    <div className="relative">
                      <input
                        id="title"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        value={heroSettings.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Geben Sie den Hero-Titel ein"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="subtitle">
                      Untertitel
                    </label>
                    <div className="relative">
                      <input
                        id="subtitle"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        value={heroSettings.subtitle}
                        onChange={(e) => handleInputChange('subtitle', e.target.value)}
                        placeholder="Geben Sie den Hero-Untertitel ein"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14l-2-16" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">
                      Beschreibung
                    </label>
                    <div className="relative">
                      <textarea
                        id="description"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                        value={heroSettings.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Geben Sie die Hero-Beschreibung ein"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={saveHeroSettings}
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
                          Änderungen speichern
                        </>
                      )}
                    </button>
                    <button
                      onClick={fetchHeroSettings}
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
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold">Vorschau</h2>
                  </div>
                  <p className="text-blue-100 mt-2 text-sm">
                    So wird Ihr Hero-Bereich auf der Startseite aussehen
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl">
                    <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                      {heroSettings.title || 'Ihr Titel hier'}
                    </h1>
                    <h2 className="text-lg lg:text-xl font-semibold mb-4 text-blue-100">
                      {heroSettings.subtitle || 'Ihr Untertitel hier'}
                    </h2>
                    <p className="text-base lg:text-lg text-blue-100 leading-relaxed">
                      {heroSettings.description || 'Ihre Beschreibung wird hier angezeigt...'}
                    </p>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-blue-100 rounded-lg">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-700 text-sm font-medium">Tipp</p>
                        <p className="text-blue-600 text-sm mt-1">
                          Änderungen werden sofort in der Vorschau angezeigt. Vergessen Sie nicht zu speichern!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
