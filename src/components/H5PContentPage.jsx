import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PlayH5p from "./PlayH5p";

const H5PContentPage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [contentData, setContentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Füge ein <style>-Element hinzu, um top-banner, nav und footer auszublenden
    const style = document.createElement("style");
    style.id = "hide-layout-style";
    style.innerHTML = `
      #top-banner,
      #gray-banner,
      nav,
      footer,
      div[style*="background-color: #e0e0e0"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Ursprüngliche Body-Stile sichern
    const originalOverflow = document.body.style.overflow;
    const originalPadding = document.body.style.padding;
    const originalMargin = document.body.style.margin;

    // Setze Body auf Vollbild
    document.body.style.overflow = "hidden";
    document.body.style.padding = "0";
    document.body.style.margin = "0";

    // H5P-Inhalt laden
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/h5pContent/${id}`
        );
        if (!response.ok) {
          throw new Error(`Fehler: ${response.status}`);
        }
        const data = await response.json();
        setContentData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching content:", err);
        setError("Der H5P-Inhalt konnte nicht geladen werden.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchContent();
    } else {
      setError("Keine Content-ID angegeben.");
      setIsLoading(false);
    }

    // Cleanup: entferne den hinzugefügten Style und stelle Body-Stile wieder her
    return () => {
      const addedStyle = document.getElementById("hide-layout-style");
      if (addedStyle) {
        document.head.removeChild(addedStyle);
      }
      document.body.style.overflow = originalOverflow;
      document.body.style.padding = originalPadding;
      document.body.style.margin = originalMargin;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="vh-100 vw-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Lade H5P-Inhalt...</span>
        </div>
        <span className="ms-2">Lade H5P-Inhalt...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vh-100 vw-100 d-flex align-items-center justify-content-center">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        padding: "0",
        width: "calc(100% - 2px)",
      }}
    >
      <PlayH5p h5pJsonPath={contentData.h5pJsonPath} />
    </div>
  );
};

export default H5PContentPage;
