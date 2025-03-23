import React, { useState, useEffect, useRef } from "react";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const PlayH5pGrid = ({ isContrast }) => {
  const [h5pData, setH5pData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isScrollable, setIsScrollable] = useState(false);

  const sliderRef = useRef(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/h5pContent`)
      .then((response) => response.json())
      .then((data) => setH5pData(data))
      .catch(console.error);
  }, []);

  // Prüfe, ob der Slider-Track scrollbar ist
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

  const categories = ["All", ...new Set(h5pData.map((item) => item.category))];

  const filteredData = h5pData.filter(
    (item) =>
      (selectedCategory === "All" || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBoxClick = (content, infoText) => {
    setCurrentContent({ content, infoText });
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setCurrentContent(null);
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
    <div
      className="container-fluid"
      style={
        isContrast
          ? { "--primary-color": "#000", "--primary-hover": "#000" }
          : {}
      }
    >
      {/* Such- und Filterbereich – zentriert */}
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-center">
          <input
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="custom-search-input"
          />
        </div>
      </div>
      <div className="row mb-4">
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

      {/* Slider-Container */}
      <div className="slider-container">
        {/* Linke Navigation */}
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

        {/* Slider-Track */}
        <div className="slider-track" ref={sliderRef}>
          {filteredData.map((item) => (
            <div key={item.id} className="slider-item">
              <div
                className="card shadow-sm modern-card"
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

        {/* Rechte Navigation */}
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
  );
};

export default PlayH5pGrid;
