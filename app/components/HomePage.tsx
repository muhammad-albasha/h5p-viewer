'use client';

import Navbar from "../components/layout/Navbar";
import Header from "../components/layout/Header";
import HeroSection from "../components/layout/HeroSection";
import FeaturedContent from "../components/content/FeaturedContent";

interface HeroSettings {
  title: string;
  subtitle: string;
  description: string;
}

interface HomePageContentProps {
  heroSettings: HeroSettings;
}

export default function HomePageContent({ heroSettings }: HomePageContentProps) {
  return (
    <>
      {/* 1. Navigation Bar */}
      <Navbar />
      
      {/* 2. Header with Logo and Settings */}
      <Header />
      
      {/* 3. Hero Section with Dynamic Content */}
      <HeroSection
        title={heroSettings.title}
        subtitle={heroSettings.subtitle}
        description={heroSettings.description}
        // coverImage="/images/hero-cover.jpg" // Optional: Add cover image path
      />
        {/* 4. Featured H5P Content Section */}
      <FeaturedContent />
        {/* 5. Footer */}
      <footer className="bg-base-300 text-base-content p-10 border-t border-base-200">
        <div className="container mx-auto max-w-6xl">
          {/* Footer Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col space-y-2">
              <span className="footer-title text-lg font-semibold mb-2">Links</span>
              <a className="link link-hover text-sm">Über uns</a>
              <a className="link link-hover text-sm">Kontakt</a>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="footer-title text-lg font-semibold mb-2">Ressourcen</span>
              <a href="/h5p" className="link link-hover text-sm">H5P-Finder</a>
              <a href="/fachbereich" className="link link-hover text-sm">Fachbereich</a>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="footer-title text-lg font-semibold mb-2">Rechtliches</span>
              <a className="link link-hover text-sm">Impressum</a>
              <a className="link link-hover text-sm">Datenschutz</a>
              <a className="link link-hover text-sm">Urheberrecht</a>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="mt-8 border-t border-base-200 pt-6 text-center text-sm opacity-60">
            <p>
              © {new Date().getFullYear()} H5P-Viewer powered by <a href="https://medialab-projekte.uni-wuppertal.de/user/Home/Privacy" className="link link-hover">Medialab</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
