import React, { useState, useEffect } from "react";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const PlayH5pGrid = () => {
  const [h5pData, setH5pData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch h5pData from the backend
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/h5pContent`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch H5P data");
        }
        return response.json();
      })
      .then((data) => setH5pData(data))
      .catch((error) => console.error("Error fetching H5P data:", error));
  }, []);

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
    <>
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
                item.info
              )
            }
          >
            <h3>{item.name}</h3>
          </div>
        ))}
      </div>
      <div className="filter">
        <div className="filter-container">
          <input
            type="text"
            placeholder="Suchen"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

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
      </div>

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
