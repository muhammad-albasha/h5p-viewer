import { useEffect, useState } from "react";
import Link from "next/link";
import FavoriteButton from "@/app/components/common/FavoriteButton";

interface H5PContent {
  id: number;
  name: string;
  path: string;
  type: string;
  tags: string[];
  slug?: string;
  coverImagePath?: string;
  description?: string;
  isPasswordProtected?: boolean;
  subject_area?: {
    name: string;
    slug: string;
  } | null;
  created_at?: string;
}

export default function FeaturedContent() {
  const [featuredContents, setFeaturedContents] = useState<H5PContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentETag, setCurrentETag] = useState<string | null>(null);

  const fetchFeaturedContents = async (force: boolean = false) => {
    try {
      if (!force) {
        setLoading(true);
      }

      // Prepare headers for conditional request
      const headers: HeadersInit = {
        "Cache-Control": "no-cache",
      };

      // Add ETag for conditional request (if we have one)
      if (currentETag && !force) {
        headers["If-None-Match"] = currentETag;
      }

      const response = await fetch("/api/featured", {
        cache: "no-store",
        headers,
      });

      // If 304 Not Modified, content hasn't changed
      if (response.status === 304) {
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch featured content");
      }

      // Update ETag for future requests
      const newETag = response.headers.get("ETag");
      if (newETag) {
        setCurrentETag(newETag);
      }

      const data = await response.json();
      setFeaturedContents(data);
    } catch (error) {
      // Error fetching featured content, use fallback only on initial load
      if (featuredContents.length === 0) {
        setFeaturedContents([
          {
            id: 1,
            name: "For or Since",
            path: "/h5p/content?id=1",
            type: "Quiz",
            tags: ["Grammatik", "Übungen"],
            slug: "for-or-since",
          },
          {
            id: 2,
            name: "Test Questionnaire",
            path: "/h5p/content?id=2",
            type: "Questionnaire",
            tags: ["Fragen", "Interaktiv"],
            slug: "test-questionnaire",
          },
          {
            id: 3,
            name: "Interactive Exercise",
            path: "/h5p/content?id=3",
            type: "Exercise",
            tags: ["Interaktiv", "Lernen"],
            slug: "interactive-exercise",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch (force = true to always load initially)
    fetchFeaturedContents(true);

    // Listen for focus events to refresh when user comes back to tab
    const handleFocus = () => {
      fetchFeaturedContents(false);
    };

    // Listen for visibility change to pause/resume polling
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User came back to tab, check for updates
        fetchFeaturedContents(false);
      }
    };

    // Listen for custom event when featured content changes in admin
    const handleFeaturedContentChanged = () => {
      fetchFeaturedContents(true); // Force fetch since we know it changed
    };

    // Listen for localStorage changes (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "featuredContentLastChange") {
        fetchFeaturedContents(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener(
      "featuredContentChanged",
      handleFeaturedContentChanged
    );
    window.addEventListener("storage", handleStorageChange);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(
        "featuredContentChanged",
        handleFeaturedContentChanged
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-fluid-2xl md:text-fluid-3xl font-bold text-gray-900 mb-4">
              Beliebte Lerninhalte
            </h2>
            <p className="text-fluid-base md:text-fluid-lg text-gray-600 max-w-2xl mx-auto">
              Entdecke unsere meistgenutzten interaktiven H5P-Elemente
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="grid-auto-responsive">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 animate-pulse card-responsive"
              >
                {/* Skeleton Image */}
                <div className="aspect-responsive-video bg-gradient-to-br from-blue-100 to-purple-100 relative">
                  <div className="absolute top-3 right-3">
                    <div className="h-6 bg-blue-200 rounded-lg w-16"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="flex justify-start">
                    <div className="h-5 bg-purple-200 rounded-lg w-20"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-12 bg-gray-200 rounded w-full"></div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="h-5 bg-gray-200 rounded-lg w-16"></div>
                    <div className="h-5 bg-gray-200 rounded-lg w-20"></div>
                    <div className="h-5 bg-gray-200 rounded-lg w-14"></div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="h-10 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50">
      <div className="container-responsive">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-fluid-2xl md:text-fluid-3xl font-bold text-gray-900 mb-4">
            Beliebte Lerninhalte
          </h2>
          <p className="text-fluid-base md:text-fluid-lg text-gray-600 max-w-2xl mx-auto">
            Entdecke unsere meistgenutzten interaktiven H5P-Elemente und starte
            dein Lernabenteuer
          </p>
        </div>

        {/* Check if no featured content */}
        {featuredContents.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 card-responsive">
            <div className="text-center py-12 md:py-16 px-6 md:px-8">
              <div className="mb-6 md:mb-8">
                <div className="p-4 bg-primary/10 rounded-full inline-block">
                  <svg
                    className="w-10 h-10 md:w-12 md:h-12 text-primary"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-fluid-xl md:text-fluid-2xl font-bold text-gray-900 mb-4">
                Keine Featured-Inhalte verfügbar
              </h3>
              <p className="text-fluid-base md:text-fluid-lg text-gray-600 mb-6 md:mb-8 max-w-lg mx-auto">
                Es wurden noch keine H5P-Elemente als Featured markiert. Besuche
                alle verfügbaren Inhalte oder kontaktiere den Administrator.
              </p>
              <Link
                href="/h5p"
                className="inline-flex items-center gap-2 px-6 md:px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg btn-responsive"
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
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Alle Inhalte entdecken
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Content Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {featuredContents.map((content) => (
                <div
                  key={content.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-white/20 transition-all duration-300 hover:scale-105 group cursor-pointer"
                >
                  {/* Card Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                    <img
                      src={
                        content.coverImagePath ||
                        `/api/h5p/cover/${content.slug}/content/images/cover.jpg`
                      }
                      alt={content.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder
                        (e.currentTarget as HTMLImageElement).src =
                          "/assets/placeholder-image.svg";
                      }}
                    />{" "}
                    {/* Content type overlay */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium backdrop-blur-sm">
                        {content.type}
                      </span>
                    </div>{" "}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <FavoriteButton content={content} variant="card" />
                      {content.isPasswordProtected && (
                        <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-500/80 hover:bg-amber-600/80 text-white rounded-lg backdrop-blur-sm transition-all duration-200">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Subject Area Badge */}
                    {content.subject_area && (
                      <div className="flex justify-start">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium">
                          {content.subject_area.name}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 group-hover: transition-colors leading-tight">
                      {content.name}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {content.description ||
                        `Interaktiver ${content.type}-Inhalt für optimales Lernen`}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {content.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                      {content.tags.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                          +{content.tags.length - 3} weitere
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <Link
                        href={content.path}
                        className="w-full bg-gradient-to-r from-primary to-secondary hover: text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
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
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Jetzt starten
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link
                href="/h5p"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-blue-600 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Alle Inhalte anzeigen
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
