"use client";

import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface SubjectArea {
  id: number;
  name: string;
  slug: string;
}

interface ContentFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  availableTags: string[];
  toggleTag: (tag: string) => void;
  subjectAreas?: SubjectArea[];
  selectedSubjectArea?: string;
  setSelectedSubjectArea?: (slug: string) => void;
}

const ContentFilter = ({  searchQuery,
  setSearchQuery,
  selectedTags,
  availableTags,
  toggleTag,
  subjectAreas = [],
  selectedSubjectArea = "",
  setSelectedSubjectArea = () => {}
}: ContentFilterProps) => {
  return (    <div className="mb-8 elevated-card p-6">
      <div className="form-control">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Inhalte suchen..." 
            className="form-input w-full pr-12" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 btn-icon p-1 rounded-md hover:bg-primary/10 transition-all duration-200" 
            aria-label="Suchen" 
            title="Suchen"
          >
            <FiSearch size={20} style={{ color: 'inherit' }} />
            <span className="sr-only">Suchen</span>
          </button>
        </div>
      </div>
        {subjectAreas.length > 0 && (        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-3 text-base-content">Filter nach Fachbereich:</h3>
          <select 
            className="form-input w-full" 
            value={selectedSubjectArea}
            onChange={(e) => setSelectedSubjectArea(e.target.value)}
            aria-label="Fachbereich auswählen"
          >
            <option value="">Alle Fachbereiche</option>
            {subjectAreas.map(area => (
              <option key={area.id} value={area.slug}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
      )}      
      <div className="mt-6">
        <h3 className="text-sm font-semibold mb-3 text-base-content">Filter nach Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              className={`badge badge-outline transition-colors duration-200 ${
                selectedTags.includes(tag) ? "badge-primary bg-primary/10" : "hover:bg-base-200"
              } p-3 cursor-pointer`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContentFilter;
