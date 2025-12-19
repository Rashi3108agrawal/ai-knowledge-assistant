import React, { useState, useEffect } from "react";
import { saveNote, fetchNotes, updateNote, deleteNote, getDocuments } from "../api/api";

export default function NotesPage({ token }) {
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDocId, setEditDocId] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const docsRes = await getDocuments(token);
        setDocuments(docsRes.data);
        const notesRes = await fetchNotes(token);
        setNotes(notesRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    if (token) fetchAllData();
  }, [token]);

  const handleSave = async () => {
    if (!title || !note) {
      alert("Title and content are required");
      return;
    }
    try {
      await saveNote({ title, content: note, documentId: documentId || null }, token);
      setTitle("");
      setNote("");
      setDocumentId("");
      setShowForm(false);
      const notesRes = await fetchNotes(token);
      setNotes(notesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (noteId) => {
    if (!editTitle || !editContent) {
      alert("Title and content are required");
      return;
    }
    try {
      await updateNote(noteId, { title: editTitle, content: editContent, documentId: editDocId || null }, token);
      setEditingId(null);
      const notesRes = await fetchNotes(token);
      setNotes(notesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(noteId, token);
        const notesRes = await fetchNotes(token);
        setNotes(notesRes.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const startEdit = (n) => {
    setEditingId(n._id);
    setEditTitle(n.title);
    setEditContent(n.content);
    setEditDocId(n.documentId?._id || "");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDocumentName = (docId) => {
    if (!docId) return "No PDF attached";
    const doc = documents.find((d) => d._id === docId);
    return doc ? doc.name : "PDF not found";
  };

  return (
    <div className="card">
      <h2>📝 Notes</h2>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ marginBottom: "20px" }}>
          ➕ New Note
        </button>
      )}

      {showForm && (
        <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
          <label>Note Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
          />

          <label>Note Content:</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Start typing your note here..."
          />

          <label>Attach to PDF (optional):</label>
          <select value={documentId} onChange={(e) => setDocumentId(e.target.value)}>
            <option value="">-- No PDF --</option>
            {documents.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.name}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSave}>💾 Save Note</button>
            <button onClick={() => setShowForm(false)} style={{ background: "#6c757d" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ color: "#667eea", marginBottom: "15px" }}>Your Notes ({notes.length})</h3>
          <ul className="notes-list" style={{ listStyle: "none", padding: 0 }}>
            {notes.map((n) =>
              editingId === n._id ? (
                <li
                  key={n._id}
                  style={{
                    background: "#f8f9fa",
                    padding: "15px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    border: "2px solid #667eea",
                  }}
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                    style={{ marginBottom: "10px", width: "100%" }}
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Content"
                    style={{ marginBottom: "10px", width: "100%", minHeight: "80px" }}
                  />
                  <select
                    value={editDocId}
                    onChange={(e) => setEditDocId(e.target.value)}
                    style={{ marginBottom: "10px", width: "100%" }}
                  >
                    <option value="">-- No PDF --</option>
                    {documents.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => handleEdit(n._id)}>✅ Save</button>
                    <button onClick={() => setEditingId(null)} style={{ background: "#6c757d" }}>
                      Cancel
                    </button>
                  </div>
                </li>
              ) : (
                <li
                  key={n._id}
                  style={{
                    background: "white",
                    padding: "15px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#667eea" }}>{n.title}</h4>
                      <p style={{ margin: "8px 0", color: "#333", lineHeight: "1.5" }}>{n.content}</p>
                      <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem", color: "#999", marginTop: "10px" }}>
                        <span>📅 {formatDate(n.createdAt)}</span>
                        <span>📎 {getDocumentName(n.documentId?._id || n.documentId)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => startEdit(n)}
                        style={{
                          padding: "6px 12px",
                          background: "#667eea",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(n._id)}
                        style={{
                          padding: "6px 12px",
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
