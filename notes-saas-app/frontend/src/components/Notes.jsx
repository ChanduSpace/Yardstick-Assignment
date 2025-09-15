import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import NoteForm from "./NoteForm";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching notes");
    }
  };

  const createNote = async (noteData) => {
    try {
      await api.post("/notes", noteData);
      setShowForm(false);
      setMessage("Note created successfully");
      setTimeout(() => setMessage(""), 3000);
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating note");
    }
  };

  const updateNote = async (noteData) => {
    try {
      await api.put(`/notes/${editingNote._id}`, noteData);
      setEditingNote(null);
      setMessage("Note updated successfully");
      setTimeout(() => setMessage(""), 3000);
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating note");
    }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setMessage("Note deleted successfully");
      setTimeout(() => setMessage(""), 3000);
      fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting note");
    }
  };

  const upgradeTenant = async () => {
    try {
      await api.post(`/tenants/${user.tenant.slug}/upgrade`);
      setMessage("Tenant upgraded to Pro successfully");
      setTimeout(() => setMessage(""), 3000);
      const updatedUser = { ...user, tenant: { ...user.tenant, plan: "pro" } };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || "Error upgrading tenant");
    }
  };

  return (
    <div className="notes-container">
      <header>
        <h2>Notes App - {user.tenant.name}</h2>
        <div>
          <span>
            Welcome, {user.email} ({user.role})
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="notes-header">
        <h3>Your Notes ({notes.length})</h3>
        {user.tenant.plan === "free" && (
          <div className="plan-info">
            <span>Free Plan ({3 - notes.length} notes remaining)</span>
            {notes.length >= 3 && (
              <button onClick={upgradeTenant} className="upgrade-btn">
                Upgrade to Pro
              </button>
            )}
          </div>
        )}
        {user.tenant.plan === "pro" && (
          <div className="plan-info">
            <span>Pro Plan (Unlimited notes)</span>
          </div>
        )}
        {user.role === "admin" && user.tenant.plan === "free" && (
          <button onClick={upgradeTenant} className="upgrade-btn">
            Upgrade to Pro
          </button>
        )}
        <button
          onClick={() => setShowForm(true)}
          disabled={user.tenant.plan === "free" && notes.length >= 3}
        >
          Add Note
        </button>
      </div>

      {showForm && (
        <NoteForm onSubmit={createNote} onCancel={() => setShowForm(false)} />
      )}

      {editingNote && (
        <NoteForm
          note={editingNote}
          onSubmit={updateNote}
          onCancel={() => setEditingNote(null)}
        />
      )}

      <div className="notes-list">
        {notes.map((note) => (
          <div key={note._id} className="note-card">
            <h4>{note.title}</h4>
            <p>{note.content}</p>
            <div className="note-actions">
              <button onClick={() => setEditingNote(note)}>Edit</button>
              <button onClick={() => deleteNote(note._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
