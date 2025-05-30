import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";

const AddH5PForm = forwardRef(({ onAdd }, ref) => {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculties, setSelectedFaculties] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [info, setInfo] = useState("");
  const [h5pFile, setH5pFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState("");

  const fetchFaculties = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/faculties`
      );
      const data = await response.json();
      // Alphabetisch sortieren nach dem Namen
      const sortedFaculties = data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setFaculties(sortedFaculties);
    } catch (error) {
      console.error("Fehler beim Abrufen der Fakultäten:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/categories`
      );
      const data = await response.json();
      // Alphabetisch sortieren nach dem Namen
      const sortedCategories = data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Fehler beim Abrufen der Kategorien:", error);
    }
  };

  useEffect(() => { fetchFaculties(); }, []);
  useEffect(() => { fetchCategories(); }, []);

  useImperativeHandle(ref, () => ({
    refreshFaculties: fetchFaculties,
    refreshCategories: fetchCategories
  }));

  const animateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 5;
        if (nextProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return nextProgress;
      });
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    animateProgress();

    const formData = new FormData();
    formData.append("h5pFile", h5pFile);
    formData.append("imageFile", imageFile);
    selectedFaculties.forEach(facId => formData.append("facultyIds", facId));
    selectedCategories.forEach(catId => formData.append("categoryIds", catId));
    formData.append("info", info);    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/h5p-contents/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );      if (response.ok) {
        const newContent = await response.json();
        // Prüfe, ob onAdd eine Funktion ist, bevor sie aufgerufen wird
        if (typeof onAdd === 'function') {
          onAdd(newContent);
        }
        setNotification("H5P-Inhalt erfolgreich hinzugefügt!");

        // Felder zurücksetzen
        setSelectedFaculties([]);
        setSelectedCategories([]);
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
      setProgress(100);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {notification && <div>{notification}</div>}

      <div>
        <label>Faculty:</label>
        <select
          multiple
          value={selectedFaculties}
          onChange={e => setSelectedFaculties(Array.from(e.target.selectedOptions, o => o.value))}
          required
        >
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Category:</label>
        <select
          multiple
          value={selectedCategories}
          onChange={e => setSelectedCategories(Array.from(e.target.selectedOptions, o => o.value))}
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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
        <div>
          <div style={{ width: `${progress}%`, background: '#007bff', height: 4 }}></div>
        </div>
      )}
    </form>
  );
});

export default AddH5PForm;
