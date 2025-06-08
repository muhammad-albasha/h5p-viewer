"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';
import ContentFilter from '@/app/components/content/ContentFilter';
import ContentCardGrid from '@/app/components/content/ContentCardGrid';
import Link from 'next/link';

interface SubjectArea {
  id: number;
  name: string;
  slug: string;
}

interface H5PContent {
  id: number;
  name: string;
  path: string;
  type: string;
  tags: string[];
  slug?: string;
  subject_area?: SubjectArea | null;
  coverImagePath?: string;
}

export default function AllH5PContent() {
  const router = useRouter();
  const [content, setContent] = useState<H5PContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<H5PContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [selectedSubjectArea, setSelectedSubjectArea] = useState('');
  
  // Fetch content and subject areas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch H5P content
        const contentResponse = await fetch('/api/h5p-content');
        if (!contentResponse.ok) {
          throw new Error('Failed to fetch content');
        }
        const contentData = await contentResponse.json();
        setContent(contentData);
        
        // Extract all unique tags
        const allTags = new Set<string>();
        contentData.forEach((item: H5PContent) => {
          item.tags?.forEach(tag => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags));
        
        // Fetch subject areas
        const subjectAreaResponse = await fetch('/api/admin/subject-areas');
        if (!subjectAreaResponse.ok) {
          throw new Error('Failed to fetch subject areas');
        }
        const subjectAreaData = await subjectAreaResponse.json();
        setSubjectAreas(subjectAreaData);        
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        // Error occurred while fetching data
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter content whenever filters change
  useEffect(() => {
    if (!content) return;
    
    let result = [...content];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      result = result.filter(item => 
        item.tags?.some(tag => selectedTags.includes(tag))
      );
    }
    
    // Filter by subject area
    if (selectedSubjectArea) {
      result = result.filter(item => 
        item.subject_area && item.subject_area.slug === selectedSubjectArea
      );
    }
    
    setFilteredContent(result);
  }, [content, searchQuery, selectedTags, selectedSubjectArea]);
  
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  return (
    <>
      <Navbar />
      <Header />
      
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            H5P-Inhalte
          </h1>
          <p className="text-primary-content/80 mt-2">
            Entdecken Sie alle verfügbaren interaktiven Lerninhalte
          </p>
        </div>
      </div>
      
      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <ContentFilter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTags={selectedTags}
            availableTags={availableTags}
            toggleTag={toggleTag}
            subjectAreas={subjectAreas}
            selectedSubjectArea={selectedSubjectArea}
            setSelectedSubjectArea={setSelectedSubjectArea}
          />
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="alert alert-info">
              <p>Keine Inhalte gefunden. Bitte ändern Sie die Filter oder versuchen Sie eine andere Suche.</p>
            </div>          ) : (
            <ContentCardGrid 
              contents={filteredContent}
              loading={isLoading}
            />
          )}
        </div>
      </div>
    </>
  );
}