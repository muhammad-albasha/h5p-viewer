"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { withBasePath } from "../../utils/paths";

// This component redirects from the old URL format (/h5p/[name]) to the new format (/h5p?id=1)
const H5PContentRedirect = () => {
  const router = useRouter();
  const params = useParams();
  const name = params.name as string;
  const decodedName = decodeURIComponent(name);

  useEffect(() => {
    // Fetch contents to find the index of the content with the given name
    const redirectToNewFormat = async () => {
      try {
        const response = await fetch(withBasePath("/api/h5p-content"));
        if (!response.ok) {
          throw new Error("Failed to fetch H5P content");
        }

        const contents = await response.json();
        const foundContent = contents.find(
          (content: any) =>
            content.name.toLowerCase() === decodedName.toLowerCase()
        );

        // If content found, redirect to new URL with the content's actual ID
        if (foundContent) {
          router.replace(`/h5p/content?id=${foundContent.id}`);
        } else {
          // If not found, redirect to home or show error
          router.replace("/");
        }
      } catch (error) {
        // Error fetching content - redirect to home
        router.replace("/");
      }
    };

    redirectToNewFormat();
  }, [decodedName, router]);

  // Show loading state while redirect is processing
  return (
    <div className="flex justify-center items-center min-h-screen">
      <span className="loading loading-spinner loading-lg"></span>
      <p className="ml-3">Redirecting to new URL format...</p>
    </div>
  );
};

export default H5PContentRedirect;
