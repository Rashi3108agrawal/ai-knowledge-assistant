import React, { useState, useEffect } from "react";
import { uploadPDF, getDocuments } from "../api/api";

export default function UploadPage({ token }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await getDocuments(token);
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  useEffect(() => {
    if (token) fetchDocuments();
  }, [token]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await uploadPDF(formData, token);
      setMessage(`✅ ${res.data.name} uploaded successfully!`);
      setFile(null);
      fetchDocuments();
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      const serverMessage = err?.response?.data?.message || err?.message || "Upload failed";
      setMessage(`❌ ${serverMessage}`);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="card">
      <h2>📤 Upload PDF</h2>
      <div className="file-input-wrapper">
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])}
          accept=".pdf"
        />
        {file && <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "8px" }}>Selected: {file.name}</p>}
      </div>
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "⏳ Uploading..." : file ? `Upload ${file.name}` : "Choose a file first"}
      </button>
      {message && (
        <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {documents.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ color: "#667eea", marginBottom: "15px" }}>📚 Upload History ({documents.length})</h3>
          <ul className="document-list">
            {documents.map((doc) => (
              <li key={doc._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{doc.name}</strong>
                  <p style={{ fontSize: "0.85rem", color: "#999", margin: "5px 0 0 0" }}>
                    📅 {formatDate(doc.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
