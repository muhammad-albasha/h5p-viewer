"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PlayH5p from '@/app/components/PlayH5p';
import { FiArrowLeft } from 'react-icons/fi';

interface H5PContentDetails {
  name: string;
  path: string;
  type: string;
  tags: string[];
}

const Fach = ({ params }: { params: { name: string } }) => {
  // Use React.use() to unwrap params as recommended by Next.js
  const unwrappedParams = React.use(params as unknown as Promise<{ name: string }>);
  const name = unwrappedParams.name;
  const decodedName = decodeURIComponent(name);
  
  const [contentDetails, setContentDetails] = useState<H5PContentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchContentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/h5p-content');
        if (!response.ok) {
          throw new Error('Failed to fetch H5P content');
        }
        
        const contents = await response.json();
        const content = contents.find((item: H5PContentDetails) => 
          item.name.toLowerCase() === decodedName.toLowerCase()
        );
        
        if (content) {
          setContentDetails(content);
        } else {
          setError(`Content "${decodedName}" not found`);
        }
      } catch (error) {
        console.error('Error fetching content details:', error);
        setError('Failed to load content details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContentDetails();
  }, [decodedName]);
  
  return (
    <div className="min-h-screen bg-base-200">
      <header className="bg-primary text-primary-content p-4">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-circle btn-ghost">
              <FiArrowLeft size={20} />
              <span className="sr-only">Zurück zur Übersicht</span>
            </Link>
            <h1 className="text-2xl font-bold">{decodedName}</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        {loading ? (
          <div className="flex justify-center my-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <p>{error}</p>
            <Link href="/" className="btn btn-primary mt-4">
              Zurück zur Übersicht
            </Link>
          </div>
        ) : contentDetails ? (
          <div className="bg-base-100 rounded-box shadow-lg p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {contentDetails.tags?.map((tag, idx) => (
                <div key={idx} className="badge badge-outline">{tag}</div>
              ))}
            </div>
            
            <h2 className="text-lg font-semibold mb-2">Typ: {contentDetails.type}</h2>
            
            <div className="divider"></div>
            
            <div className="mt-6 rounded-lg overflow-hidden">
              <PlayH5p h5pJsonPath={contentDetails.path} />
            </div>
          </div>
        ) : (
          <div className="alert alert-warning">
            <p>Keine Inhalte gefunden.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Fach