import Link from 'next/link';
import React from 'react';

interface H5PContent {
  name: string;
  path: string;
  type: string;
  tags: string[];
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
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content, index) => (
        <Link 
          key={index} 
          href={`/fachbereich/${encodeURIComponent(content.name)}`}
          className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="card-body">
            <h2 className="card-title">{content.name}</h2>
            <p className="text-sm opacity-70">Typ: {content.type}</p>
            <div className="card-actions justify-end mt-2">
              {content.tags?.map((tag, idx) => (
                <div key={idx} className="badge badge-outline">{tag}</div>
              ))}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ContentCardGrid;
