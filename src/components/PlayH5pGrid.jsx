import React, { useState, useEffect } from "react";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const PlayH5pGrid = ({ isContrast }) => {
  const [h5pData, setH5pData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/h5pContent`)
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
    <div
      className="container-fluid"
      style={
        isContrast
          ? { "--primary-color": "#000", "--primary-hover": "#000" }
          : {}
      }
    >
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
      <div className="row flex-grow-1 overflow-auto">
        <div className="col-12">
          <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3">
            {filteredData.map((item) => (
              <div key={item.id} className="col" style={{ minWidth: "150px" }}>
                <div
                  className="card h-100 shadow-sm"
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
        </div>
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
