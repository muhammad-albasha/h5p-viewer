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
  return (
    <div className="mb-8 bg-base-100 rounded-box p-4 shadow-lg">
      <div className="form-control">
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Inhalte suchen..." 
            className="input input-bordered w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-square" aria-label="Suchen" title="Suchen">
            <FiSearch />
            <span className="sr-only">Suchen</span>
          </button>
        </div>
      </div>
        {subjectAreas.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Filter nach Fachbereich:</h3>
          <select 
            className="select select-bordered w-full" 
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
      
      <div className="mt-4">
        <h3 className="text-sm font-semibold mb-2">Filter nach Tags:</h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              className={`badge badge-outline ${
                selectedTags.includes(tag) ? "badge-primary" : ""
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
