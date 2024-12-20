import React, { useState, useEffect } from "react";

const AddH5PForm = ({ onAdd }) => {
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [category, setCategory] = useState("");
  const [info, setInfo] = useState("");
  const [h5pFile, setH5pFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    // Fakultäten laden
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!h5pFile || !imageFile || !selectedFaculty || !category || !info) {
      alert("Bitte füllen Sie alle Felder aus.");
      return;
    }

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
        }
      );

      if (response.ok) {
        const newContent = await response.json();
        onAdd(newContent); // Neuer Inhalt zur Liste hinzufügen
        // Felder zurücksetzen
        setSelectedFaculty("");
        setCategory("");
        setInfo("");
        setH5pFile(null);
        setImageFile(null);
      } else {
        console.error("Fehler beim Hinzufügen des H5P-Inhalts");
      }
    } catch (error) {
      console.error("Fehler beim Hochladen:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-h5p-form">
      <div>
        <label>Fakultät:</label>
        <select
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          required
        >
          <option value="" disabled>
            Fakultät auswählen
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
      <button type="submit">Hinzufügen</button>
    </form>
  );
};

export default AddH5PForm;