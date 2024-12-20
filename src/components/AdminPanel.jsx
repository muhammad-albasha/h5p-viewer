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
    const token = localStorage.getItem("token"); // Token aus dem lokalen Speicher abrufen

    if (!token) {
      setNotification("Nicht authentifiziert. Bitte melden Sie sich an.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/faculties`,
        {
          method: "POST",
          body: JSON.stringify({
            name: formData.get("name"),
          }),
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
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button
          onClick={() => setIsH5PFormVisible((prev) => !prev)}
          className="admin-button"
        >
          {isH5PFormVisible ? "Abbrechen" : "Neu H5P-Inhalt"}
        </button>
        <button
          onClick={() => setIsFacultyFormVisible((prev) => !prev)}
          className="admin-button"
        >
          {isFacultyFormVisible ? "Abbrechen" : "Neu Fachbereich"}
        </button>
      </div>
      {isFacultyFormVisible && (
        <form onSubmit={handleFacultySubmit} className="add-faculty-form">
          <div>
            <label htmlFor="faculty-name">Fachbereich: </label>
            <input type="text" name="name" id="faculty-name" required />
          </div>
          <button type="submit" className="admin-button">
            Hinzufügen
          </button>
        </form>
      )}
      {isH5PFormVisible && (
        <AddH5PForm onAdd={(newContent) => console.log(newContent)} />
      )}
    </div>
  );
};

export default AdminPanel;
