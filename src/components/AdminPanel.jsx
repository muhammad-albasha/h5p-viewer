import React, { useState, useEffect, useRef } from "react";
import AddH5PForm from "./AddH5PForm";

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

const AdminPanel = ({ addH5PFormRef }) => {
  // Profile
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [isProfileEdit, setIsProfileEdit] = useState(false);

  useEffect(() => {
    // Beispiel: API-Call für Profil laden
    fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          password: ''
        });
      });
  }, []);

  const updateProfile = async () => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify(profile)
    });
    setIsProfileEdit(false);
  };

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

  const addFaculty = async (name, description) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/faculties`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      setFaculties([await res.json(), ...faculties]);
      if (addH5PFormRef.current) addH5PFormRef.current.refreshFaculties();
    }
  };

  const updateFaculty = async (id, name, description) => {
    const res = await fetch(`${process.env.REACT_APP_API_URL}/api/faculties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFaculties(faculties.map(f => f.id === id ? updated : f));
      setEditFaculty(null);
      if (addH5PFormRef.current) addH5PFormRef.current.refreshFaculties();
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
        if (addH5PFormRef.current) addH5PFormRef.current.refreshFaculties();
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
    if (res.ok) {
      setCategories([await res.json(), ...categories]);
      if (addH5PFormRef.current) addH5PFormRef.current.refreshCategories();
    }
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
      if (addH5PFormRef.current) addH5PFormRef.current.refreshCategories();
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
        if (addH5PFormRef.current) addH5PFormRef.current.refreshCategories();
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

      {/* Profile Section */}
      <div>
        <h3>Profil</h3>
        {isProfileEdit ? (
          <div>
            <input type="text" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} placeholder="Vorname" />
            <input type="text" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} placeholder="Nachname" />
            <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="E-Mail" />
            <input type="password" value={profile.password} onChange={e => setProfile({ ...profile, password: e.target.value })} placeholder="Neues Passwort (optional)" />
            <button onClick={updateProfile}>Speichern</button>
            <button onClick={() => setIsProfileEdit(false)}>Abbrechen</button>
          </div>
        ) : (
          <div>
            <p>Vorname: {profile.firstName}</p>
            <p>Nachname: {profile.lastName}</p>
            <p>E-Mail: {profile.email}</p>
            <button onClick={() => setIsProfileEdit(true)}>Profil bearbeiten</button>
          </div>
        )}
      </div>

      {/* Faculty Section */}
      <h3>Faculty:</h3>
      <button onClick={() => setIsFacultyFormVisible(!isFacultyFormVisible)}>+</button>
      {isFacultyFormVisible && (
        <form onSubmit={e => { e.preventDefault(); addFaculty(e.target.name.value, e.target.description.value); e.target.reset(); }}>
          <input name="name" placeholder="Fachbereich Name" required />
          <input name="description" placeholder="Beschreibung" />
          <button type="submit">Hinzufügen</button>
        </form>
      )}
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Beschreibung</th><th>Aktionen</th></tr>
        </thead>
        <tbody>
          {faculties.map(faculty => (
            <tr key={faculty.id}>
              <td>{faculty.id}</td>
              <td>{editFaculty?.id === faculty.id ? (
                <input value={editFaculty.name} onChange={e => setEditFaculty({ ...editFaculty, name: e.target.value })} />
              ) : faculty.name}</td>
              <td>{editFaculty?.id === faculty.id ? (
                <input value={editFaculty.description || ""} onChange={e => setEditFaculty({ ...editFaculty, description: e.target.value })} />
              ) : (faculty.description || "")}</td>
              <td>
                {editFaculty?.id === faculty.id ? (
                  <>
                    <button onClick={() => updateFaculty(faculty.id, editFaculty.name, editFaculty.description)}>Speichern</button>
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

export default function AdminPanelWrapper() {  const addH5PFormRef = useRef();
  
  // Callback-Funktion für erfolgreich hinzugefügte H5P-Inhalte
  const handleAddH5P = (newContent) => {
    console.log("Neuer H5P-Inhalt wurde hinzugefügt:", newContent);
    // Hier können Sie weitere Aktionen ausführen, z.B. UI aktualisieren
  };
  
  return (
    <>
      <AdminPanel addH5PFormRef={addH5PFormRef} />
      <div style={{ marginTop: 40 }}>
        <AddH5PForm ref={addH5PFormRef} onAdd={handleAddH5P} />
      </div>
    </>
  );
}

// For backward compatibility
export { AdminPanel };
