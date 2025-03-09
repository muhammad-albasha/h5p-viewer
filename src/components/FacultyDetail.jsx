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
          `${process.env.REACT_APP_API_URL}/faculties`
        );
        const faculties = await facultyResponse.json();
        const matchedFaculty = faculties.find(
          (f) => f.name === decodeURIComponent(name)
        );

        if (matchedFaculty) {
          const h5pResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/h5pContent?facultyId=${matchedFaculty.id}`
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
    <div className="container-fluid" style={{ minHeight: "100vh" }}>
      {/* Header und Filterbereich */}
      <div className="row my-4">
        <div className="col-md-8 mx-auto text-center">
          <h2>{decodeURIComponent(name)}</h2>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
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
        <div className="col-md-10 mx-auto d-flex flex-wrap gap-2 justify-content-center">
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

      {/* Grid-Bereich */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-5 g-4">
            {filteredData.map((item) => (
              <div key={item.id} className="col">
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
                      height: "200px",
                      backgroundImage: `url(${item.previewImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                    }}
                  >
                    <div className="image-overlay" />
                  </div>
                  <div className="card-body text-center">
                    <h5 className="card-title">{item.name}</h5>
                    {/* Hier ist der einzige Unterschied: text-start sorgt für linksbündigen Info-Text */}
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

export default FacultyDetail;
