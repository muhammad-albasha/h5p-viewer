import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";
import FacultyMenu from "./FacultyMenu";

const FacultyDetail = ({ isContrast }) => {
  const { name } = useParams();
  const [h5pData, setH5pData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [isScrollable, setIsScrollable] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const sliderRef = useRef(null);
  const searchInputRef = useRef(null);

  // Daten für die Fakultät und zugehörige H5P-Inhalte laden
  useEffect(() => {
    const fetchH5PDataForFaculty = async () => {
      try {
        const facultyResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/faculties`
        );
        const faculties = await facultyResponse.json();
        // Fakultäten alphabetisch sortieren
        const sortedFaculties = faculties.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        const matchedFaculty = sortedFaculties.find(
          (f) => f.name === decodeURIComponent(name)
        );

        if (matchedFaculty) {
          const h5pResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/h5pContent?facultyId=${matchedFaculty.id}`
          );
          const h5pData = await h5pResponse.json();
          // H5P-Inhalte alphabetisch sortieren
          const sortedH5pData = h5pData.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setH5pData(sortedH5pData);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }
    };

    fetchH5PDataForFaculty();
  }, [name]);

  // Prüfe, ob der Slider scrollbar ist
  useEffect(() => {
    const checkScrollable = () => {
      if (sliderRef.current) {
        setIsScrollable(
          sliderRef.current.scrollWidth > sliderRef.current.clientWidth
        );
      }
    };
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [h5pData, searchTerm, selectedCategory]);

  // Kategorien ableiten
  const categories = ["Alle", ...new Set(h5pData.map((item) => item.category))];

  // Filtere die H5P-Inhalte nach Kategorie und Suchbegriff
  const filteredData = h5pData.filter(
    (item) =>
      (selectedCategory === "Alle" || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vorschläge für das Suchfeld (unabhängig von der Kategorie)
  const suggestions = h5pData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBoxClick = (content, infoText) => {
    setCurrentContent({ content, infoText });
    setIsPopupOpen(true);
    setShowSuggestions(false);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setCurrentContent(null);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (searchTerm) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Kurze Verzögerung, damit Klicks auf Vorschläge registriert werden
    setTimeout(() => {
      setShowSuggestions(false);
    }, 100);
  };

  const scrollLeft = () => {
    if (sliderRef.current && isScrollable) {
      sliderRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current && isScrollable) {
      sliderRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="container-fluid" style={{ padding: "0 0" }}>
      {/* Layout: Seitenmenü und Inhalt */}
      <div className="row g-0">
        <div className="col-md-3 p-0">
          <FacultyMenu isContrast={isContrast} />
        </div>
        <div className="col-md-9 p-0">
          <div className="row">
            <div className="col-12 text-center">
              <h2>{decodeURIComponent(name)}</h2>
            </div>
          </div>
          {/* Suchfeld mit Dropdown für Vorschläge */}
          <div className="row mb-2">
            <div className="col-12 d-flex justify-content-center position-relative">
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="custom-search-input"
                ref={searchInputRef}
              />
              {showSuggestions && searchTerm && (
                <div className="suggestions-dropdown">
                  {suggestions.length > 0 ? (
                    suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="suggestion-item"
                        onMouseDown={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.name}
                      </div>
                    ))
                  ) : (
                    <div className="suggestion-item">
                      Keine Vorschläge gefunden
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Filterbuttons */}
          <div className="row mb-2">
            <div className="col-12 d-flex justify-content-center">
              <div className="custom-filter-container">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`custom-filter-button ${
                      selectedCategory === category ? "active" : ""
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Slider-Container für H5P-Karten */}
          <div className="slider-container">
            <button
              className={`custom-slider-button left ${
                !isScrollable ? "disabled" : ""
              }`}
              onClick={scrollLeft}
              disabled={!isScrollable}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#89ba17"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 18L8 12l6-6" />
              </svg>
            </button>
            <div className="slider-track" ref={sliderRef}>
              {filteredData.map((item) => (
                <div key={item.id} className="slider-item">
                  <div
                    className="card custom-card shadow-sm"
                    onClick={() =>
                      handleBoxClick(
                        <PlayH5p h5pJsonPath={item.h5pJsonPath} />,
                        item.info
                      )
                    }
                  >
                    <div
                      className="card-img-top"
                      style={{
                        height: "150px",
                        backgroundImage: `url(${item.previewImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <div className="image-overlay" />
                    </div>
                    <div className="card-body text-center">
                      <h5 className="card-title">{item.name}</h5>
                      <div className="card-text small text-muted text-start">
                        {item.info.substring(0, 60)}...
                      </div>
                      <button
                        className="custom-link-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBoxClick(
                            <PlayH5p h5pJsonPath={item.h5pJsonPath} />,
                            item.info
                          );
                        }}
                      >
                        Mehr erfahren →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              className={`custom-slider-button right ${
                !isScrollable ? "disabled" : ""
              }`}
              onClick={scrollRight}
              disabled={!isScrollable}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#89ba17"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          {isPopupOpen && (
            <Popup
              content={currentContent.content}
              infoText={currentContent.infoText}
              onClose={closePopup}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDetail;
