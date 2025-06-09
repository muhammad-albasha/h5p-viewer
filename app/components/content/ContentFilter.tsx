"use client";

import React from "react";
import { FiSearch } from "react-icons/fi";

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

const ContentFilter = ({
  searchQuery,
  setSearchQuery,
  selectedTags,
  availableTags,
  toggleTag,
  subjectAreas = [],
  selectedSubjectArea = "",
  setSelectedSubjectArea = () => {},
}: ContentFilterProps) => {
  return (
    <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
      {/* Filter Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Inhalte filtern</h2>
            <p className="text-blue-100 text-sm mt-1">
              Suchen und filtern Sie H5P-Inhalte
            </p>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-6 space-y-6">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Suchbegriff
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Inhalte suchen..."
              className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Suche löschen"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Subject Area Filter */}
        {subjectAreas.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fachbereich
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              value={selectedSubjectArea}
              onChange={(e) => setSelectedSubjectArea(e.target.value)}
              aria-label="Fachbereich auswählen"
            >
              <option value="">Alle Fachbereiche</option>
              {subjectAreas.map((area) => (
                <option key={area.id} value={area.slug}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tags Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Tags
            </label>
          </div>
          
          {availableTags.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 bg-gray-100 rounded-full inline-block mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Keine Tags verfügbar</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    selectedTags.includes(tag)
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  <span className="flex items-center gap-1">
                    {selectedTags.includes(tag) && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {tag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentFilter;
