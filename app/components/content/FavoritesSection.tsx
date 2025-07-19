"use client";

import React from "react";
import Link from "next/link";
import { useFavorites } from "@/app/hooks/useFavorites";
import FavoriteButton from "@/app/components/common/FavoriteButton";
import { withBasePath } from '@/app/utils/paths';
import styles from "./ContentCard.module.css";

const FavoritesSection: React.FC = () => {
  const { favorites, isLoading, clearAllFavorites } = useFavorites();

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-primary via-secondary to-primary">
        <div className="container-fluid mx-auto ">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meine Favoriten
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deine gespeicherten H5P-Inhalte für schnellen Zugriff
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 animate-pulse"
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-purple-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-primary/20 rounded-xl w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (favorites.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50">
        <div className="container-fluid mx-auto ">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meine Favoriten
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deine gespeicherten H5P-Inhalte für schnellen Zugriff
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="text-center py-16 px-8">
              <div className="mb-8">
                <div className="p-4 bg-primary/10 rounded-full inline-block">
                  <svg
                    className="w-12 h-12 text-primary"
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
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Noch keine Favoriten
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                Speichere deine liebsten H5P-Inhalte als Favoriten, um sie
                schnell wiederzufinden. Klicke einfach auf das Herz-Symbol bei
                jedem Inhalt.
              </p>
              <Link
                href="/h5p"
                className="inline-flex items-center gap-2 px-8 py-3 bg-primary dark:bg-black hover:from-secondary hover:to-primary text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
                Inhalte entdecken
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50">
      <div className="container-fluid mx-auto ">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <svg
                className="w-8 h-8 text-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Meine Favoriten
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <p className="text-lg text-gray-600">
              {favorites.length}{" "}
              {favorites.length === 1 ? "Favorit" : "Favoriten"} gespeichert
            </p>
            {favorites.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline transition-colors"
              >
                Alle entfernen
              </button>
            )}
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {favorites.map((content) => {
            // Determine image URL
            let imageUrl = content.coverImagePath;

            if (!imageUrl) {
              if (content.slug) {
                imageUrl = `/api/h5p/cover/${content.slug}/content/images/cover.jpg`;
              } else {
                let pathSlug = content.path;
                if (pathSlug.startsWith("/h5p/")) {
                  pathSlug = pathSlug.replace("/h5p/", "");
                }
                pathSlug = pathSlug
                  .replace(/^\/?h5p\/?/, "")
                  .replace(/\/+$/, "");
                imageUrl = `/api/h5p/cover/${pathSlug}/content/images/cover.jpg`;
              }
            }

            return (
              <div
                key={content.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl overflow-hidden border border-white/20 transition-all duration-300 hover:scale-105 group cursor-pointer"
              >
                {/* Card Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={content.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        withBasePath("/assets/placeholder-image.svg");
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium backdrop-blur-sm">
                      {content.type || 'H5P'}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <FavoriteButton content={content} variant="card" />
                    {content.isPasswordProtected && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 border border-white/30">
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
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors leading-tight">
                    {content.name}
                  </h3>

                  {/* Description */}
                  <p className={`text-gray-600 text-sm leading-relaxed ${styles.descriptionTruncate}`}>
                    {content.description ||
                      `Interaktiver ${content.type || 'H5P'}-Inhalt für optimales Lernen`}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {content.tags
                      ?.slice()
                      .sort((a, b) => a.localeCompare(b))
                      .slice(0, 3)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    {content.tags && content.tags.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                        +{content.tags.length - 3} weitere
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      href={`/h5p/content?id=${content.id}`}
                      className="w-full bg-primary dark:bg-black hover:from-primary-dark hover:to-secondary text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2"
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
            );
          })}
        </div>

        {/* View All Favorites Button */}
        <div className="text-center">
          <Link
            href="/h5p?favorites=true"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm hover:bg-white/90 text-gray-700 hover:text-purple-600 font-semibold rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Alle Favoriten anzeigen
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FavoritesSection;
