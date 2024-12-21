import React, { useState, useEffect } from "react";

const AddH5PForm = ({ onAdd }) => {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [category, setCategory] = useState("");
  const [info, setInfo] = useState("");
  const [h5pFile, setH5pFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // Fortschritt der Animation
  const [notification, setNotification] = useState("");

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

  const animateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 5; // Fortschritt um 5% erhöhen
        if (nextProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return nextProgress;
      });
    }, 200); // Alle 200 ms aktualisieren
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    animateProgress();

    const formData = new FormData();
    formData.append("h5pFile", h5pFile);
    formData.append("imageFile", imageFile);
    formData.append("facultyId", selectedFaculty);
    formData.append("category", category);
    formData.append("info", info);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/h5pContent`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      if (response.ok) {
        const newContent = await response.json();
        onAdd(newContent);
        setNotification("H5P-Inhalt erfolgreich hinzugefügt!");

        // Felder zurücksetzen
        setSelectedFaculty("");
        setCategory("");
        setInfo("");
        setH5pFile(null);
        setImageFile(null);
        e.target.reset();
      } else {
        const errorMessage = await response.text();
        setNotification(`Fehler: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Fehler beim Hochladen:", error);
      setNotification("Fehler beim Hinzufügen des H5P-Inhalts.");
    } finally {
      setUploading(false);
      setProgress(100); // Fortschritt auf 100% setzen
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-h5p-form">
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

      <div>
        <label>Fachbereich:</label>
        <select
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          required
        >
          <option value="" disabled>
            Fachbereich auswählen
          </option>
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Kategorie:</label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </div>
      <div>
        <label>H5P-Datei:</label>
        <input
          type="file"
          accept=".h5p"
          onChange={(e) => setH5pFile(e.target.files[0])}
          required
        />
      </div>
      <div>
        <label>Vorschau-Bild:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          required
        />
      </div>
      <div>
        <label>Info:</label>
        <textarea
          value={info}
          onChange={(e) => setInfo(e.target.value)}
          required
        ></textarea>
      </div>

      <button type="submit" disabled={uploading}>
        {uploading ? "Hochladen..." : "Hinzufügen"}
      </button>
      {/* Prozessleiste */}
      {uploading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </form>
  );
};

export default AddH5PForm;
