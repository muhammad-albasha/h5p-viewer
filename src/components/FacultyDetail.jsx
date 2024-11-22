import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const FacultyDetail = () => {
  const { name } = useParams(); // Fakultätsname aus der URL
  const [h5pData, setH5pData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const baseUrl = process.env.PUBLIC_URL || "";
    fetch(`${baseUrl}/h5pPaths.json`)
      .then((response) => response.json())
      .then((data) => {
        const filteredData = data.filter(
          (item) => item.facultyName === decodeURIComponent(name) // Name entschlüsseln
        );
        setH5pData(filteredData);
      })
      .catch((error) =>
        console.error("Fehler beim Abrufen der H5P-Daten:", error)
      );
  }, [name]);

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

  return (
    <div>
      <h2>{decodeURIComponent(name)}</h2>

      {/* Suchleiste */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Suchen Sie nach H5P-Inhalten..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Kategorie-Filter */}
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Inhalte */}
      <div className="container">
        {filteredData.map((item) => (
          <div
            className="play-h5p-box"
            key={item.id}
            style={{
              backgroundImage: `url(${
                process.env.PUBLIC_URL + item.previewImage
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() =>
              handleBoxClick(
                <PlayH5p h5pJsonPath={item.h5pJsonPath} />,
                item.info
              )
            }
          >
            <h3>{item.name}</h3>
          </div>
        ))}
      </div>

      {/* Popup */}
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

export default FacultyDetail;
