import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FacultyMenu from "./FacultyMenu"; // Import der Fakultät-Menü-Komponente
import PlayH5p from "./PlayH5p";
import Popup from "./Popup";

const FacultyDetail = () => {
  const { name } = useParams(); // Fakultätsname aus der URL
  const [h5pData, setH5pData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchH5PDataForFaculty = async () => {
      try {
        // Abrufen der Fakultät, um die ID zu ermitteln
        const facultyResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/faculties`
        );
        if (!facultyResponse.ok) {
          throw new Error(`HTTP-Fehler: ${facultyResponse.status}`);
        }
        const faculties = await facultyResponse.json();

        // Passende Fakultät anhand des Namens finden
        const matchedFaculty = faculties.find(
          (f) => f.name === decodeURIComponent(name)
        );
        if (!matchedFaculty) {
          console.error("Keine passende Fakultät gefunden");
          return;
        }

        // H5P-Daten für die Fakultät abrufen
        const h5pResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/h5pContent?facultyId=${matchedFaculty.id}`
        );
        if (!h5pResponse.ok) {
          throw new Error(`HTTP-Fehler: ${h5pResponse.status}`);
        }
        const h5pData = await h5pResponse.json();
        setH5pData(h5pData);
      } catch (error) {
        console.error("Fehler beim Abrufen der H5P-Daten:", error);
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
    <>
      {/* Fakultät-Menü */}
      <FacultyMenu />

      <h2 className="facName">{decodeURIComponent(name)}</h2>

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

      <div className="container">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
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
          ))
        ) : (
          <p>Keine H5P-Inhalte für diese Fakultät verfügbar.</p>
        )}
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

export default FacultyDetail;
