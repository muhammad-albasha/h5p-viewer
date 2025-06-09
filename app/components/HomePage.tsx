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
      />      {/* 4. Featured H5P Content Section */}
      <FeaturedContent />
    </>
  );
}
