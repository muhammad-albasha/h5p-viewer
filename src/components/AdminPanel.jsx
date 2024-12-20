import React, { useState, useEffect } from "react";
import AddH5PForm from "./AddH5PForm";

const AdminPanel = () => {
  const [isH5PFormVisible, setIsH5PFormVisible] = useState(false);
  const [isFacultyFormVisible, setIsFacultyFormVisible] = useState(false);
  const [faculties, setFaculties] = useState([]);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/faculties`
        );
        const data = await response.json();
        setFaculties(data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Fakultäten:", error);
      }
    };

    fetchFaculties();
  }, []);

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

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
          },
        }
      );

      if (response.ok) {
        const newFaculty = await response.json();
        setFaculties((prevFaculties) => [...prevFaculties, newFaculty]);
        form.reset();
        setIsFacultyFormVisible(false);
      } else {
        console.error("Fehler beim Hinzufügen der Fakultät");
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen der Fakultät:", error);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Hinzufügen</h2>
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
          <div className="add-faculty-form">
            <label htmlFor="faculty-name">Fachbereich: </label>
            <br /> <br />
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

      <div>
        <ul>
          {faculties.map((faculty) => (
            <li key={faculty.id}>{faculty.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPanel;
