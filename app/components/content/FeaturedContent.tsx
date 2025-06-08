import { useEffect, useState } from "react";
import Link from "next/link";

interface H5PContent {
  id: number;
  name: string;
  path: string;
  type: string;
  tags: string[];
  slug?: string;
  coverImagePath?: string;
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
    }; // Listen for visibility change to pause/resume polling
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User came back to tab, check for updates
        fetchFeaturedContents(false);
      }
    }; // Listen for custom event when featured content changes in admin
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
    window.addEventListener("storage", handleStorageChange); // Cleanup on unmount
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
      <section className="py-16 px-4 bg-base-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
              Beliebte Lerninhalte
            </h2>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Entdecke unsere meistgenutzten interaktiven H5P-Elemente
            </p>
          </div>{" "}          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg animate-pulse border border-base-300/50 overflow-hidden"
              >
                {/* Skeleton Image */}
                <div className="h-48 bg-base-300 relative">
                  <div className="absolute top-3 right-3">
                    <div className="h-7 bg-base-300/70 rounded-full w-20"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-base-300/70 rounded-full"></div>
                  </div>
                </div>
                
                <div className="card-body p-6 space-y-4">
                  <div className="flex justify-start">
                    <div className="h-5 bg-base-300 rounded-full w-16"></div>
                  </div>
                  <div className="h-6 bg-base-300 rounded w-3/4"></div>
                  <div className="h-12 bg-base-300 rounded w-full"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-base-300 rounded-full w-16"></div>
                    <div className="h-5 bg-base-300 rounded-full w-20"></div>
                    <div className="h-5 bg-base-300 rounded-full w-14"></div>
                  </div>
                  <div className="pt-4 border-t border-base-300/30">
                    <div className="h-10 bg-base-300 rounded-full w-full"></div>
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
    <section className="py-16 px-4 bg-base-100">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-base-content mb-4">
            Beliebte Lerninhalte
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Entdecke unsere meistgenutzten interaktiven H5P-Elemente und starte
            dein Lernabenteuer
          </p>
        </div>

        {/* Check if no featured content */}
        {featuredContents.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8">
              <svg
                className="w-24 h-24 mx-auto text-base-content/30"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-base-content mb-4">
              Keine Featured-Inhalte verfügbar
            </h3>
            <p className="text-lg text-base-content/70 mb-8 max-w-lg mx-auto">
              Es wurden noch keine H5P-Elemente als Featured markiert. Besuche
              alle verfügbaren Inhalte oder kontaktiere den Administrator.
            </p>
            <a href="/h5p" className="btn btn-primary btn-lg px-8">
              Alle Inhalte entdecken
            </a>
          </div>
        ) : (
          <>
            {" "}
            {/* Featured Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">              {featuredContents.map((content) => (
                <div
                  key={content.id}
                  className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-base-300/50 overflow-hidden"
                >                  {/* Card Image */}
                  <figure className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                    <img
                      src={content.coverImagePath || `/api/h5p/cover/${content.slug}/content/images/cover.jpg`}
                      alt={content.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder
                        (e.currentTarget as HTMLImageElement).src = '/assets/placeholder-image.svg';
                      }}
                    />
                    {/* Content type overlay */}
                    <div className="absolute top-3 right-3">
                      <div className="badge badge-primary badge-lg font-semibold px-3 py-2 shadow-lg bg-primary/90 backdrop-blur-sm">
                        {content.type}
                      </div>
                    </div>
                  </figure>

                  <div className="card-body p-6 space-y-4">
                    {/* Subject Area Badge */}
                    <div className="flex justify-start items-start">
                      {content.subject_area && (
                        <div className="badge badge-outline badge-sm border-2 font-medium">
                          {content.subject_area.name}
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="card-title text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-200">
                      {content.name}
                    </h3>

                    {/* Description Space */}
                    <p className="text-base-content/70 text-sm leading-relaxed min-h-[3rem] flex items-center">
                      Interaktiver {content.type}-Inhalt für ein besseres
                      Lernerlebnis
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {content.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="badge badge-secondary badge-sm text-xs font-medium px-2 py-1 hover:badge-primary transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                      {content.tags.length > 3 && (
                        <span className="badge badge-ghost badge-sm text-xs font-medium">
                          +{content.tags.length - 3} weitere
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="card-actions justify-center pt-4 border-t border-base-300/30">
                      <Link
                        href={content.path}
                        className="btn btn-primary btn-wide hover:btn-primary-focus group-hover:scale-105 transition-all duration-200 shadow-md font-semibold"
                      >
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
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* View All Button */}
            <div className="text-center">
              <Link href="/h5p" className="btn btn-outline btn-lg px-8 py-3">
                Alle Inhalte anzeigen
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
