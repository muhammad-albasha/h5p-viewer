import Link from 'next/link';
import React from 'react';

interface H5PContent {
  id?: number;
  name: string;
  path: string;
  type: string;
  tags: string[];
  slug?: string;
  coverImagePath?: string;
  description?: string;
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
      <div className="flex justify-center my-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="alert alert-info">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Keine Inhalte gefunden. Bitte ändere deine Filtereinstellungen.</span>
        </div>
      </div>
    );
  }  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {contents.map((content, index) => {// Determine image URL - prioritize coverImagePath from database
        let imageUrl = content.coverImagePath;
        
        // If no coverImagePath, construct from slug or path
        if (!imageUrl) {
          if (content.slug) {
            imageUrl = `/api/h5p/cover/${content.slug}/content/images/cover.jpg`;
          } else {
            // Fallback: construct from path
            let pathSlug = content.path;
            if (pathSlug.startsWith('/h5p/')) {
              pathSlug = pathSlug.replace('/h5p/', '');
            }
            pathSlug = pathSlug.replace(/^\/?h5p\/?/, '').replace(/\/+$/, '');
            imageUrl = `/api/h5p/cover/${pathSlug}/content/images/cover.jpg`;
          }
        }
        
        return (          <div
            key={content.id || index}
            className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-base-300/50 overflow-hidden"
          >
            {/* Card Image */}
            <figure className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
              <img
                src={imageUrl}
                alt={content.name}
                className="w-full h-full object-cover"
                onError={(e) => {
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
              </h3>              {/* Description Space */}
              <p className="text-base-content/70 text-sm leading-relaxed min-h-[3rem] flex items-center">
                {content.description || `Interaktiver ${content.type}-Inhalt für ein besseres Lernerlebnis`}
              </p>{/* Tags */}
              <div className="flex flex-wrap gap-2">
                {content.tags?.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="badge bg-gradient-to-r from-secondary/80 to-secondary text-secondary-content border-0 shadow-sm font-medium px-3 py-1 text-xs hover:from-primary/80 hover:to-primary hover:text-primary-content transition-all duration-200 hover:shadow-md hover:scale-105"
                  >
                    {tag}
                  </span>
                ))}
                {content.tags && content.tags.length > 3 && (
                  <span className="badge bg-gradient-to-r from-base-300 to-base-200 text-base-content border-0 shadow-sm font-medium px-3 py-1 text-xs">
                    +{content.tags.length - 3} weitere
                  </span>
                )}
              </div>

              {/* Action Button */}
              <div className="card-actions justify-center pt-4 border-t border-base-300/30">
                <Link
                  href={`/h5p/content?id=${content.id || index + 1}`}
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
        );
      })}
    </div>
  );
};

export default ContentCardGrid;
