"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/layout/Navbar";
import Header from "./components/layout/Header";
import Banner from "./components/layout/Banner";
import ContentFilter from "./components/content/ContentFilter";
import ContentCardGrid from "./components/content/ContentCardGrid";

interface H5PContent {
  name: string;
  path: string;
  type: string;
  tags: string[];
}

export default function Home() {
  const [h5pContents, setH5pContents] = useState<H5PContent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([
    "Quiz", "Fragen", "Übungen", "Grammatik", "Wortschatz", "Interaktiv"
  ]);
  const [loading, setLoading] = useState(true);

  // Fetch H5P content from our API
  useEffect(() => {
    const fetchH5PContents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/h5p-content');
        if (!response.ok) {
          throw new Error('Failed to fetch H5P content');
        }
        const data = await response.json();
        setH5pContents(data);

        // Extract all unique tags from content
        const allTags = data.flatMap((content: H5PContent) => content.tags || []);
        const uniqueTags = [...new Set(allTags)] as string[];
        if (uniqueTags.length > 0) {
          setAvailableTags(uniqueTags);
        }
      } catch (error) {
        console.error('Error fetching H5P content:', error);
        // Fallback to mock data if API fails
        setH5pContents([
          { name: "For or Since", path: "/h5p/for-or-since", type: "Quiz", tags: ["Grammatik", "Übungen"] },
          { name: "Test Questionnaire", path: "/h5p/test-questionnaire", type: "Questionnaire", tags: ["Fragen", "Interaktiv"] },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchH5PContents();
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const filteredContent = h5pContents.filter(content => {
    const matchesSearch = content.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTags = selectedTags.length === 0 || content.tags?.some(tag => selectedTags.includes(tag));
    return matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Navigation Bar */}
      <Navbar />

      {/* 2. Header with Logo and Settings */}
      <Header />

      {/* 3. Banner with H1 */}
      <Banner title="H5P-Viewer" />

      <main className="flex-grow bg-base-200 p-4">
        <div className="container mx-auto">
          {/* 4. Filter Section */}
          <ContentFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTags={selectedTags}
            availableTags={availableTags}
            toggleTag={toggleTag}
          />

          {/* 5. H5P Content Cards */}
          <ContentCardGrid contents={filteredContent} loading={loading} />
        </div>
      </main>

      <footer className="bg-neutral text-neutral-content p-6">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} H5P-Viewer</p>
        </div>
      </footer>
    </div>
  );
}
