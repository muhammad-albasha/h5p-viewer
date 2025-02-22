import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const FacultyDetail = () => {
  const { name } = useParams();
  const [h5pData, setH5pData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchH5PDataForFaculty = async () => {
      try {
        const facultyResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/faculties`
        );
        const faculties = await facultyResponse.json();
        const matchedFaculty = faculties.find(
          (f) => f.name === decodeURIComponent(name)
        );

        if (matchedFaculty) {
          const h5pResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/api/h5pContent?facultyId=${matchedFaculty.id}`
          );
          const h5pData = await h5pResponse.json();
          setH5pData(h5pData);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }
    };

    fetchH5PDataForFaculty();
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
    <div className="container-fluid">
      {/* Header-Bereich mit Titel und Suche */}
      <div className="row align-items-center mb-4">
        <div className="col-md-8">
          <h2 className="mb-3 mb-md-0">{decodeURIComponent(name)}</h2>
        </div>
      </div>

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

export default FacultyDetail;
