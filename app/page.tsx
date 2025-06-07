"use client";

import Navbar from "./components/layout/Navbar";
import Header from "./components/layout/Header";
import HeroSection from "./components/layout/HeroSection";
import FeaturedContent from "./components/content/FeaturedContent";

export default function Home() {
  return (
    <>
      {/* 1. Navigation Bar */}
      <Navbar />
      
      {/* 2. Header with Logo and Settings */}
      <Header />
      
      {/* 3. Hero Section with Title, Cover and Description */}
      <HeroSection
        title="H5P-Viewer"
        subtitle="Interaktive Lerninhalte für dein Studium"
        description="Entdecke eine vielfältige Sammlung von interaktiven H5P-Elementen, die das Lernen spannend und effektiv machen. Von Quizzes über Präsentationen bis hin zu interaktiven Videos – hier findest du alles für ein modernes Lernerlebnis."
        // coverImage="/images/hero-cover.jpg" // Optional: Add cover image path
      />
      
      {/* 4. Featured H5P Content Section */}
      <FeaturedContent />
      
      {/* 5. Footer */}
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
            <div>
              <span className="footer-title">Ressourcen</span>
              <a href="/h5p" className="link link-hover">Alle Inhalte</a>
              <a href="/setup-help" className="link link-hover">Hilfe & Support</a>
              <a className="link link-hover">Dokumentation</a>
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
