"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TestExtraction() {
  const { data: session } = useSession();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const testExtraction = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/test-extract');
      const data = await response.json();
      
      setResult(data);
      
      if (!response.ok) {
        throw new Error(data.error || "Test failed");
      }
    } catch (err: any) {
      setError(err.message || "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="mt-4 p-4 border border-base-300 rounded-lg bg-base-200">
      <h3 className="text-lg font-bold mb-2">H5P-Extraktionstest</h3>
      
      <button 
        onClick={testExtraction}
        className="btn btn-sm btn-primary mb-4"
        disabled={loading}
      >
        {loading ? "Wird getestet..." : "Extraktion testen"}
      </button>
      
      {error && (
        <div className="bg-error/10 border-l-4 border-error p-4 rounded mb-4">
          <p className="text-error">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-base-100 p-4 rounded overflow-auto max-h-60">
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
