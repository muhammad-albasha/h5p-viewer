import React, { useState, useEffect } from "react";


const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div>
      <div>
        <p>{message}</p>
        <div>
          <button onClick={onConfirm}>Ja</button>
          <button onClick={onCancel}>Nein</button>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  // Faculty
  const [faculties, setFaculties] = useState([]);
  const [editFaculty, setEditFaculty] = useState(null);
  const [isFacultyFormVisible, setIsFacultyFormVisible] = useState(false);

  // Category
  const [categories, setCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);
  const [isCategoryFormVisible, setIsCategoryFormVisible] = useState(false);

  // Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  // FACULTY CRUD
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/faculties`)
      .then((res) => res.json())
      .then(data => Array.isArray(data) ? setFaculties(data) : setFaculties([]))
      .catch(() => setFaculties([]));
  }, []);

  const addFaculty = async (name) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/faculties`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ name }),
    });
    if (res.ok) setFaculties([await res.json(), ...faculties]);
  };

  const updateFaculty = async (id, name) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/faculties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFaculties(faculties.map(f => f.id === id ? updated : f));
      setEditFaculty(null);
    }
  };

  const deleteFaculty = (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Fachbereich wirklich löschen?",
      onConfirm: async () => {
        await fetch(`${process.env.REACT_APP_API_URL}/api/faculties/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setFaculties(faculties.filter(f => f.id !== id));
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
      },
    });
  };

  // CATEGORY CRUD
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/categories`)
      .then((res) => res.json())
      .then(data => Array.isArray(data) ? setCategories(data) : setCategories([]))
      .catch(() => setCategories([]));
  }, []);

  const addCategory = async (name) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ name }),
    });
    if (res.ok) setCategories([await res.json(), ...categories]);
  };

  const updateCategory = async (id, name) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories(categories.map(c => c.id === id ? updated : c));
      setEditCategory(null);
    }
  };

  const deleteCategory = (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Kategorie wirklich löschen?",
      onConfirm: async () => {
        await fetch(`${process.env.REACT_APP_API_URL}/api/categories/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCategories(categories.filter(c => c.id !== id));
        setConfirmModal({ isOpen: false, message: "", onConfirm: null });
      },
    });
  };

  return (
    <div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, message: "", onConfirm: null })}
      />

      {/* Faculty Section */}
      <h3>Faculty:</h3>
      <button onClick={() => setIsFacultyFormVisible(!isFacultyFormVisible)}>+</button>
      {isFacultyFormVisible && (
        <form onSubmit={e => { e.preventDefault(); addFaculty(e.target.name.value); e.target.reset(); }}>
          <input name="name" placeholder="Fachbereich Name" required />
          <button type="submit">Hinzufügen</button>
        </form>
      )}
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Aktionen</th></tr>
        </thead>
        <tbody>
          {faculties.map(faculty => (
            <tr key={faculty.id}>
              <td>{faculty.id}</td>
              <td>{editFaculty?.id === faculty.id ? (
                <input value={editFaculty.name} onChange={e => setEditFaculty({ ...editFaculty, name: e.target.value })} />
              ) : faculty.name}</td>
              <td>
                {editFaculty?.id === faculty.id ? (
                  <>
                    <button onClick={() => updateFaculty(faculty.id, editFaculty.name)}>Speichern</button>
                    <button onClick={() => setEditFaculty(null)}>Abbrechen</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditFaculty(faculty)}>Bearbeiten</button>
                    <button onClick={() => deleteFaculty(faculty.id)}>Löschen</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Category Section */}
      <h3>Category:</h3>
      <button onClick={() => setIsCategoryFormVisible(!isCategoryFormVisible)}>+</button>
      {isCategoryFormVisible && (
        <form onSubmit={e => { e.preventDefault(); addCategory(e.target.name.value); e.target.reset(); }}>
          <input name="name" placeholder="Kategorie Name" required />
          <button type="submit">Hinzufügen</button>
        </form>
      )}
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Aktionen</th></tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category.id}>
              <td>{category.id}</td>
              <td>{editCategory?.id === category.id ? (
                <input value={editCategory.name} onChange={e => setEditCategory({ ...editCategory, name: e.target.value })} />
              ) : category.name}</td>
              <td>
                {editCategory?.id === category.id ? (
                  <>
                    <button onClick={() => updateCategory(category.id, editCategory.name)}>Speichern</button>
                    <button onClick={() => setEditCategory(null)}>Abbrechen</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditCategory(category)}>Bearbeiten</button>
                    <button onClick={() => deleteCategory(category.id)}>Löschen</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
