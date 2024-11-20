import React, { useState } from "react";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const PlayH5pGrid = ({ h5pData }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extrahiere einzigartige Kategorien aus den Daten
  const categories = ["All", ...new Set(h5pData.map((item) => item.category))];

  // Filtered data based on search term and category
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
    <>
      {/* Filter by Search */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Suchen Sie nach H5P-Inhalten..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter by Category */}
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

      {/* Grid */}
      <div className="container">
        {filteredData.map((item) => (
          <div
            className="play-h5p-box"
            key={item.id}
            style={{
              backgroundImage: `url(${item.previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={() =>
              handleBoxClick(
                <PlayH5p h5pJsonPath={item.h5pJsonPath} />,
                item.info // Info aus JSON abrufen
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
    </>
  );
};

export default PlayH5pGrid;
