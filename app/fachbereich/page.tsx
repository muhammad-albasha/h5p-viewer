"use client";
import { useEffect, useState } from "react";
import Navbar from "@/app/components/layout/Navbar";
import Header from "@/app/components/layout/Header";
import Link from "next/link";

interface SubjectArea {
  id: number;
  name: string;
  slug: string;
  color?: string;
}
const FachbereichOverview = () => {
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchSubjectAreas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/subject-areas");

        if (!response.ok) {
          throw new Error("Fachbereiche konnten nicht geladen werden");
        }

        const data = await response.json();
        setSubjectAreas(data);
      } catch (err: any) {
        setError(err.message || "Ein Fehler ist aufgetreten");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubjectAreas();
  }, []);

  return (
    <>
      <Navbar />
      <Header />

      <div className="bg-gradient-to-br from-primary to-secondary text-primary-content py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Fachbereiche
          </h1>
          <p className="text-primary-content/80 mt-2">
            H5P-Inhalte nach Fachbereichen durchsuchen
          </p>
        </div>
      </div>

      <div className="bg-base-200 min-h-screen py-10">
        <div className="container mx-auto max-w-6xl px-4">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="loading loading-spinner loading-lg"></div>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          ) : subjectAreas.length === 0 ? (
            <div className="alert alert-info">
              <p>Keine Fachbereiche gefunden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subjectAreas.map((area) => (
                <Link
                  key={area.id}
                  href={`/fachbereich/${area.slug}`}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="card-body">
                    {" "}
                    <div className="flex items-center gap-3 mb-2">
                      {area.color && (
                        <input
                          type="color"
                          value={area.color}
                          disabled
                          className="w-4 h-4 rounded-full border-0 cursor-default"
                          title={`Farbe: ${area.color}`}
                        />
                      )}
                      <h2 className="card-title">{area.name}</h2>
                    </div>
                    <p>Alle Inhalte zu diesem Fachbereich anzeigen</p>
                    <div className="card-actions justify-end">
                      <button className="btn btn-primary">Öffnen</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FachbereichOverview;
