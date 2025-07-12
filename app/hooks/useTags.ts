"use client";

import { useState, useEffect } from "react";

// Define the tag interface
interface Tag {
  id: number;
  name: string;
}

// Create a simple in-memory cache
let cachedTags: Tag[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);

        // Check if we have valid cached data
        const now = Date.now();
        if (
          cachedTags &&
          cacheTimestamp &&
          now - cacheTimestamp < CACHE_DURATION
        ) {
          // Use cached data if it's still fresh
          setTags(cachedTags.map((tag) => tag.name));
          setIsLoading(false);
          return;
        }

        // Fetch fresh data if cache is stale or doesn't exist
        const response = await fetch("/api/tags");

        if (!response.ok) {
          throw new Error(`Error fetching tags: ${response.status}`);
        }

        const data: Tag[] = await response.json();

        // Update the cache
        cachedTags = data;
        cacheTimestamp = now;

        // Update state with tag names
        setTags(data.map((tag) => tag.name));
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error fetching tags")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, isLoading, error };
}
