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
    <div className="container-fluid vh-100 d-flex flex-column">
      {/* Header und Filterbereich */}
      <div className="row flex-shrink-0">
        <div className="col-12">
          <div className="row justify-content-center mb-4">
            <div className="col-md-8 text-center">
              <h2>{decodeURIComponent(name)}</h2>
            </div>
          </div>

          <div className="row justify-content-center mb-4">
            <div className="col-md-8">
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control mx-auto"
                style={{ maxWidth: "600px" }}
              />
            </div>
          </div>

          <div className="row justify-content-center mb-4">
            <div className="col-md-10">
              <div className="d-flex flex-wrap justify-content-center gap-2">
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
        </div>
      </div>

      {/* Scrollbarer Grid-Bereich */}
      <div className="row flex-grow-1 overflow-hidden mb-5">
        <div className="col-12 h-100">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-5 g-4 h-100">
            {filteredData.map((item) => (
              <div key={item.id} className="col">
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
                      height: "200px",
                      backgroundImage: `url(${item.previewImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                    }}
                  >
                    <div className="image-overlay" />
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{item.name}</h5>
                    <div className="card-text small text-muted">
                      {item.info.substring(0, 80)}...
                    </div>
                    <button className="btn btn-link p-0 small">
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
