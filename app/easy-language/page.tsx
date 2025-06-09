import React from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/layout/Navbar';
import Header from '@/app/components/layout/Header';

export default function easyLanguagePage() {
  return (
    <>
      <Navbar />
      <Header />
      
      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Leichte Sprache
          </h1>
          <p className="text-primary-content/80 mt-2">
            Willkommen auf der H5P-Viewer Plattform!
          </p>
        </div>
      </div>
      
      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="bg-base-100 rounded-xl shadow-xl overflow-hidden">
          </div>
        </div>
      </div>
    </>
  );
}
