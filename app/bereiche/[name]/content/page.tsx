"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import PlayH5p from "@/app/components/PlayH5p";
import FavoriteButton from "@/app/components/common/FavoriteButton";
import PasswordProtection from "@/app/components/common/PasswordProtection";
import { withBasePath } from "../../../utils/paths";

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
  isPasswordProtected?: boolean;
}

const ContentView = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectAreaSlug = params.name as string;
  const contentId = searchParams.get('id');
  
  const [content, setContent] = useState<SubjectAreaContent | null>(null);
  const [subjectAreaName, setSubjectAreaName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password protection states
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState<string>("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error('Fehler beim Kopieren der URL:', error);
      // Fallback für ältere Browser
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  useEffect(() => {
    if (!contentId) {
      router.push(withBasePath(`/bereiche/${subjectAreaSlug}`));
      return;
    }

    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(withBasePath("/api/h5p-content"));

        if (!response.ok) {
          throw new Error("Inhalt konnte nicht geladen werden");
        }

        const allContent = await response.json();

        // Find the specific content by ID and subject area
        const foundContent = allContent.find(
          (item: SubjectAreaContent) =>
            item.id.toString() === contentId &&
            item.subject_area && 
            item.subject_area.slug === subjectAreaSlug
        );

        if (!foundContent) {
          throw new Error("Inhalt nicht gefunden");
        }

        setContent(foundContent);
        setSubjectAreaName(foundContent.subject_area.name);

        // Check if content is password protected
        try {
          const protectionResponse = await fetch(
            withBasePath(`/api/h5p/check-protection/${foundContent.id}`)
          );
          if (protectionResponse.ok) {
            const protectionData = await protectionResponse.json();
            if (protectionData.isPasswordProtected) {
              setIsPasswordProtected(true);
              setIsPasswordVerified(false);
            } else {
              setIsPasswordProtected(false);
              setIsPasswordVerified(true);
            }
          } else {
            setIsPasswordProtected(false);
            setIsPasswordVerified(true);
          }
        } catch (error) {
          // If protection check fails, assume no protection
          setIsPasswordProtected(false);
          setIsPasswordVerified(true);
        }
      } catch (err: any) {
        setError(err.message || "Ein Fehler ist aufgetreten");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, subjectAreaSlug, router]);

  const handlePasswordSubmit = async (enteredPassword: string) => {
    setPasswordLoading(true);
    setPasswordError("");

    try {
      const response = await fetch(withBasePath("/api/h5p/verify-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId: content?.id,
          password: enteredPassword,
        }),
      });

      if (response.ok) {
        setIsPasswordVerified(true);
        setIsPasswordProtected(false);
      } else {
        const data = await response.json();
        setPasswordError(
          data.error || "Falsches Passwort. Bitte versuchen Sie es erneut."
        );
      }
    } catch (error) {
      setPasswordError(
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-5">
          <div className="w-full px-4 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-primary rounded-full animate-spin"></div>
                <p className="text-gray-600 mt-4 font-medium">
                  Inhalt wird geladen...
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Bitte warten Sie einen Moment
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !content) {
    return (
      <>
        <Navbar />
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-5">
          <div className="w-full px-4 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
              <div className="flex flex-col items-center justify-center p-12">
                <div className="p-4 bg-red-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-red-600 font-medium text-lg">
                  {error || "Inhalt nicht gefunden"}
                </p>
                <Link
                  href={withBasePath(`/bereiche/${subjectAreaSlug}`)}
                  className="mt-4 px-6 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Zurück zur Übersicht
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Header />
      
      {/* Password Protection Check */}
      {isPasswordProtected && !isPasswordVerified ? (
        <PasswordProtection
          title={content.name}
          onPasswordSubmit={handlePasswordSubmit}
          error={passwordError}
          loading={passwordLoading}
        />
      ) : (
        <>
          {/* Enhanced Header for View Mode */}
          <div className="relative overflow-hidden bg-primary dark:bg-black">
            <div className="absolute inset-0">
              <div className=""></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48 backdrop-blur-3xl"></div>
            </div>

            <div className="relative container-fluid mx-auto px-4 py-4">
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center space-x-2 text-sm mb-8 text-blue-100">
                <Link
                  href={withBasePath("/")}
                  className="hover:text-white transition-colors"
                >
                  Startseite
                </Link>
                <span>•</span>
                <Link
                  href={withBasePath("/bereiche")}
                  className="hover:text-white transition-colors"
                >
                  Bereiche
                </Link>
                <span>•</span>
                <Link
                  href={withBasePath(`/bereiche/${subjectAreaSlug}`)}
                  className="hover:text-white transition-colors"
                >
                  {subjectAreaName}
                </Link>
                <span>•</span>
                <span className="text-white font-medium">
                  {content.name}
                </span>
              </nav>

              <div className="grid lg:grid-cols-12 gap-2 items-center">
                <div className="lg:col-span-8 space-y-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium backdrop-blur-sm">
                      {content.type}
                    </span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                    {content.name}
                  </h1>
                  <p className="text-blue-100 text-xl leading-relaxed max-w-2xl">
                    Interaktiver {content.type}-Inhalt für optimales Lernen
                  </p>
                  {/* Tags */}
                  {content.tags && content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {content.tags
                        .slice()
                        .sort((a, b) => a.localeCompare(b))
                        .map((tag, idx) => (
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

                <div className="lg:col-span-4 flex flex-col gap-3">
                  <Link
                    href={withBasePath(`/bereiche/${subjectAreaSlug}`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105 border border-white/20"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Zurück zur Übersicht
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <FavoriteButton
                      content={content}
                      variant="header"
                      showText={true}
                    />
                    <button 
                      onClick={handleShare}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-200 text-sm relative"
                    >
                      <svg
                        className="w-4 h-4"
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
                      {shareSuccess ? 'Kopiert!' : 'Teilen'}
                      
                      {/* Success notification */}
                      {shareSuccess && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap shadow-lg animate-fade-in-out">
                          URL kopiert!
                        </div>
                      )}
                    </button>
                  </div>

                  {content && content.subject_area && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-blue-100 text-sm font-medium mb-1">
                        Bereich
                      </div>
                      <div className="text-white font-semibold">
                        {content.subject_area.name}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* H5P Content */}
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-5">
            <div className="w-full px-4 space-y-8">
              <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
                <div className="p-2">
                  <div className="bg-gray-50 rounded-xl p-2 w-full">
                    <PlayH5p h5pJsonPath={content.path} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ContentView;
