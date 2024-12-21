import React, { useState } from "react";
import AddH5PForm from "./AddH5PForm";

const AdminPanel = () => {
  const [isH5PFormVisible, setIsH5PFormVisible] = useState(false);
  const [isFacultyFormVisible, setIsFacultyFormVisible] = useState(false);
  const [notification, setNotification] = useState("");

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const token = localStorage.getItem("token");

    if (!token) {
      setNotification("Nicht authentifiziert. Bitte melden Sie sich an.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/faculties`,
        {
          method: "POST",
          body: JSON.stringify({ name: formData.get("name") }),
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (response.ok) {
        form.reset();
        setIsFacultyFormVisible(false);
        setNotification("Fachbereich erfolgreich hinzugefügt!");
      } else {
        const errorText = await response.text();
        setNotification(`Fehler: ${errorText}`);
      }
    } catch (error) {
      setNotification("Fehler beim Hinzufügen der Fakultät.");
      console.error("Fehler beim Hinzufügen der Fakultät:", error);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Hinzufügen</h2>
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
            setIsH5PFormVisible(true);
            setIsFacultyFormVisible(false);
          }}
          className="admin-button"
        >
          Neu H5P-Inhalt
        </button>
        <button
          onClick={() => {
            setIsFacultyFormVisible(true);
            setIsH5PFormVisible(false);
          }}
          className="admin-button"
        >
          Neu Fachbereich
        </button>
      </div>

      {/* Formularbereiche */}
      {isH5PFormVisible && (
        <AddH5PForm
          onAdd={(newContent) => {
            console.log(newContent);
            setNotification("H5P-Inhalt erfolgreich hinzugefügt!");
            setIsH5PFormVisible(false); // Nach Abschluss schließen
          }}
        />
      )}

      {isFacultyFormVisible && (
        <form onSubmit={handleFacultySubmit} className="add-faculty-form">
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
    </div>
  );
};

export default AdminPanel;
