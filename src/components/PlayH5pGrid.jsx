import React, { useState, useEffect } from "react";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const PlayH5pGrid = () => {
  const [h5pData, setH5pData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/h5pContent`)
      .then((response) => response.json())
      .then((data) => setH5pData(data))
      .catch(console.error);
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
    <div className="container-fluid">
      {/* Such- und Filterbereich */}
      <div className="row mb-4">
        <div className="col-12 col-md-8 mb-3 mb-md-0">
          <input
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`btn btn-sm ${
                  selectedCategory === category
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inhalts-Grid */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {filteredData.map((item) => (
          <div
            key={item.id}
            className="col"
            onClick={() =>
              handleBoxClick(
                <PlayH5p h5pJsonPath={item.h5pJsonPath} />,
                item.info
              )
            }
            style={{
              backgroundImage: `url(${item.previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
              minHeight: "200px",
            }}
          >
            <div className="h-100 d-flex align-items-end p-3 bg-dark bg-opacity-50 text-white">
              <h5 className="mb-0">{item.name}</h5>
            </div>
          </div>
        ))}
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
