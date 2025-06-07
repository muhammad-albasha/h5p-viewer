"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/layout/Navbar";
import Header from "./components/layout/Header";
import Banner from "./components/layout/Banner";
import ContentCardGrid from "./components/content/ContentCardGrid";

interface H5PContent {
  name: string;
  path: string;
  type: string;
  tags: string[];
}

export default function Home() {
  const [h5pContents, setH5pContents] = useState<H5PContent[]>([]);
  const [loading, setLoading] = useState(true);
  // Fetch H5P content from our API
  useEffect(() => {
    const fetchH5PContents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/h5p-content");
        if (!response.ok) {
          throw new Error("Failed to fetch H5P content");
        }        const data = await response.json();
        setH5pContents(data);
      } catch (error) {
        // Fallback to mock data if API fails
        setH5pContents([
          {
            name: "For or Since",
            path: "/h5p/for-or-since",
            type: "Quiz",
            tags: ["Grammatik", "Übungen"],
          },
          {
            name: "Test Questionnaire",
            path: "/h5p/test-questionnaire",
            type: "Questionnaire",
            tags: ["Fragen", "Interaktiv"],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchH5PContents();
  }, []);
  return (
    <>
      {/* 1. Navigation Bar */}
      <Navbar />
      {/* 2. Header with Logo and Settings */}
      <Header />
      {/* 3. Banner with H1 */}
      <Banner
        title="H5P-Viewer"
        subtitle="Entdecke interaktive Lerninhalte für dein Studium"
      />{" "}      <main className="flex-grow bg-base-100 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* H5P Content Cards */}
          <ContentCardGrid
            contents={h5pContents}
            loading={loading}
          />
        </div>
      </main>
      <footer className="bg-base-300 text-base-content p-10 border-t border-base-200">
        <div className="container mx-auto max-w-6xl">
          <div className="footer">
            <div>
              <span className="footer-title">H5P-Viewer</span>
              <p className="max-w-xs">
                Eine Plattform für interaktive Lernmaterialien, die das
                Lernerlebnis verbessert.
              </p>
            </div>
            <div>
              <span className="footer-title">Links</span>
              <a className="link link-hover">Über uns</a>
              <a className="link link-hover">Kontakt</a>
              <a className="link link-hover">Hilfe</a>
            </div>
          </div>
          <div className="mt-8 border-t border-base-200 pt-6 text-center text-sm opacity-60">
            <p>
              © {new Date().getFullYear()} H5P-Viewer. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
