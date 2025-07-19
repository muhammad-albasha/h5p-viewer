import Link from "next/link";
import React from "react";
import FavoriteButton from "@/app/components/common/FavoriteButton";
import { withBasePath } from "../../utils/paths";

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
}

interface ContentCardGridProps {
  contents: H5PContent[];
  loading: boolean;
}

const ContentCardGrid = ({ contents, loading }: ContentCardGridProps) => {
  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 responsive-card">
        <div className="flex flex-col items-center justify-center responsive-padding-lg">
          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4 font-medium text-fluid-base">
            Inhalte werden geladen...
          </p>
          <p className="text-gray-500 text-fluid-sm mt-1">
            Bitte warten Sie einen Moment
          </p>
        </div>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 responsive-card">
        <div className="flex flex-col items-center justify-center responsive-padding-lg">
          <div className="p-3 md:p-4 bg-primary/10 rounded-full mb-4">
            <svg
              className="w-6 h-6 md:w-8 md:h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium text-fluid-lg">
            Keine Inhalte gefunden
          </p>
          <p className="text-gray-500 text-fluid-sm mt-1 text-center">
            Bitte ändern Sie die Filter oder versuchen Sie eine andere Suche.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {contents
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((content, index) => {
          // Determine image URL - prioritize coverImagePath from database
          let imageUrl = content.coverImagePath;

          // If no coverImagePath, construct from slug or path
          if (!imageUrl) {
            if (content.slug) {
              imageUrl = `/api/h5p/cover/${content.slug}/content/images/cover.jpg`;
            } else {
              // Fallback: construct from path
              let pathSlug = content.path;
              if (pathSlug.startsWith("/h5p/")) {
                pathSlug = pathSlug.replace("/h5p/", "");
              }
              pathSlug = pathSlug.replace(/^\/?h5p\/?/, "").replace(/\/+$/, "");
              imageUrl = `/api/h5p/cover/${pathSlug}/content/images/cover.jpg`;
            }
          }

          return (
            <div
              key={content.id || index}
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
                    {content.type}
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
                <p className="text-gray-600 text-sm leading-relaxed">
                  {content.description ||
                    `Interaktiver ${content.type}-Inhalt für optimales Lernen`}
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
                    href={withBasePath(`/h5p/content?id=${content.id || index + 1}`)}
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
  );
};

export default ContentCardGrid;
