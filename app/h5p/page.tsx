"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// This page redirects to the new URL format /h5p/content?id=X
export default function H5PRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  useEffect(() => {
    // If there's an ID in the URL, redirect to the new format
    if (id) {
      router.replace(`/h5p/content?id=${id}`);
    } else {
      // If no ID, just go to the homepage
      router.replace('/');
    }
  }, [id, router]);
  
  // Show loading state while redirecting
  return (
    <div className="flex justify-center items-center min-h-screen">
      <span className="loading loading-spinner loading-lg"></span>
      <p className="ml-3">Redirecting...</p>
    </div>
  );
}