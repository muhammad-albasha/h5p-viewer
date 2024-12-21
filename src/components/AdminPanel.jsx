import React, { useState, useEffect } from "react";
import AddH5PForm from "./AddH5PForm";

const AdminPanel = () => {
  const [isH5PFormVisible, setIsH5PFormVisible] = useState(false);
  const [isFacultyFormVisible, setIsFacultyFormVisible] = useState(false);
  const [isRemoveFacultyVisible, setIsRemoveFacultyVisible] = useState(false);
  const [isRemoveH5PVisible, setIsRemoveH5PVisible] = useState(false);
  const [notification, setNotification] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [h5pContents, setH5pContents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facultyResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/faculties`
        );
        const h5pResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/h5pContent`
        );

        if (facultyResponse.ok) {
          const facultyData = await facultyResponse.json();
          setFaculties(facultyData);
        }

        if (h5pResponse.ok) {
          const h5pData = await h5pResponse.json();
          setH5pContents(h5pData);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }
    };

    fetchData();
  }, []);

  const handleRemoveFaculty = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/faculties/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      if (response.ok) {
        setNotification("Fachbereich erfolgreich entfernt!");
        setFaculties(faculties.filter((faculty) => faculty.id !== id));
      } else {
        setNotification("Fehler beim Entfernen des Fachbereichs.");
      }
    } catch (error) {
      setNotification("Fehler beim Entfernen des Fachbereichs.");
    }
  };

  const handleRemoveH5P = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/h5pContent/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: localStorage.getItem("token") },
        }
      );

      if (response.ok) {
        setNotification("H5P-Inhalt erfolgreich entfernt!");
        setH5pContents(h5pContents.filter((content) => content.id !== id));
      } else {
        setNotification("Fehler beim Entfernen des H5P-Inhalts.");
      }
    } catch (error) {
      setNotification("Fehler beim Entfernen des H5P-Inhalts.");
    }
  };

  const resetAllSections = () => {
    setIsH5PFormVisible(false);
    setIsFacultyFormVisible(false);
    setIsRemoveFacultyVisible(false);
    setIsRemoveH5PVisible(false);
  };

  return (
    <div className="admin-panel">
      <h2>Admin-Panel</h2>
      {notification && (
        <div className="notification">
          {notification}
          <button
            onClick={() => setNotification("")}
            className="close-notification"
          >
            &times;
          </button>
        </div>
      )}

      {/* Navigationsbereich */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={() => {
            resetAllSections();
            setIsH5PFormVisible(!isH5PFormVisible);
          }}
          className="admin-button"
        >
          Neu H5P-Inhalt
        </button>
        <button
          onClick={() => {
            resetAllSections();
            setIsFacultyFormVisible(!isFacultyFormVisible);
          }}
          className="admin-button"
        >
          Neu Fachbereich
        </button>
        <button
          onClick={() => {
            resetAllSections();
            setIsRemoveFacultyVisible(!isRemoveFacultyVisible);
          }}
          className="admin-button"
        >
          Fachbereich entfernen
        </button>
        <button
          onClick={() => {
            resetAllSections();
            setIsRemoveH5PVisible(!isRemoveH5PVisible);
          }}
          className="admin-button"
        >
          H5P-Inhalt entfernen
        </button>
      </div>

      {/* Formularbereiche */}
      {isH5PFormVisible && (
        <AddH5PForm
          onAdd={(newContent) => {
            setH5pContents([...h5pContents, newContent]);
            setNotification("H5P-Inhalt erfolgreich hinzugefügt!");
            setIsH5PFormVisible(false);
          }}
        />
      )}

      {isFacultyFormVisible && (
        <form className="add-faculty-form">
          <div>
            <label htmlFor="faculty-name">Fachbereich:</label>
            <br />
            <br />
            <input type="text" name="name" id="faculty-name" required />
          </div>
          <button type="submit" className="admin-button">
            Hinzufügen
          </button>
        </form>
      )}

      {isRemoveFacultyVisible && (
        <div className="faculty-list">
          <h3>Fachbereich</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {faculties.map((faculty) => (
                <tr key={faculty.id}>
                  <td>{faculty.name}</td>
                  <td>
                    <button
                      onClick={() => handleRemoveFaculty(faculty.id)}
                      className="remove-button"
                    >
                      Entfernen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Entfernen von H5P-Inhalten */}
      {isRemoveH5PVisible && (
        <div className="h5p-list">
          <h3>H5P</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Kategorie</th>
                <th>Fakultät</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {h5pContents.map((content) => (
                <tr key={content.id}>
                  <td>{content.name}</td>
                  <td>{content.category || "Keine Kategorie"}</td>
                  <td>
                    {faculties.find(
                      (faculty) => faculty.id === content.facultyId
                    )?.name || "Unbekannt"}
                  </td>
                  <td>
                    <button
                      onClick={() => handleRemoveH5P(content.id)}
                      className="remove-button"
                    >
                      Entfernen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
