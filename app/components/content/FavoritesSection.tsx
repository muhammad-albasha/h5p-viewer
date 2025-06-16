"use client";

import React from "react";
import Link from "next/link";
import { useFavorites } from "@/app/hooks/useFavorites";
import FavoriteButton from "@/app/components/common/FavoriteButton";

const FavoritesSection: React.FC = () => {
  const { favorites, isLoading, clearAllFavorites } = useFavorites();

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20 animate-pulse"
              >
                <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-purple-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
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
                <div className="p-4 bg-purple-100 rounded-full inline-block">
                  <svg
                    className="w-12 h-12 text-purple-500"
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
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg"
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
    <section className="py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <div className="container-fluid mx-auto ">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg
                className="w-8 h-8 text-purple-600"
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
          <div className="flex items-center justify-center gap-8 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <Link
                key={content.id}
                href={content.path}
                className="group block"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl overflow-hidden border border-white/20 transition-all duration-300 hover:scale-105">
                  {/* Card Image */}
                  <div className="relative h-32 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={content.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/assets/placeholder-image.svg";
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <FavoriteButton
                        content={content}
                        variant="card"
                        className="bg-red-500/80 hover:bg-red-600/80 text-white"
                      />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {/* Title */}
                    <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors text-sm leading-tight overflow-hidden text-ellipsis line-clamp-2">
                      {content.name}
                    </h3>

                  </div>
                </div>
              </Link>
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
