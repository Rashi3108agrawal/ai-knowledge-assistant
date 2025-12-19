import React, { useState } from "react";
import { searchDocuments } from "../api/api";

export default function SearchPage({ token }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (page = 1) => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await searchDocuments(query, token, page, 5);
      setResults(res.data.results);
      setPagination(res.data.pagination);
      setCurrentPage(page);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      regex.test(part) ? (
        <mark key={idx} style={{ background: "#ffeb3b", padding: "2px 4px", borderRadius: "3px" }}>
          {part}
        </mark>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  return (
    <div className="card">
      <h2>🔍 Search Documents</h2>
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter search keywords..."
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSearch(1);
          }}
          style={{ flex: 1 }}
        />
        <button onClick={() => handleSearch(1)} disabled={!query || loading}>
          {loading ? "⏳ Searching..." : "Search"}
        </button>
      </div>

      {results.length > 0 && (
        <div className="search-results">
          <h3 style={{ color: "#667eea", marginBottom: "15px" }}>
            Found {pagination?.total} result{pagination?.total !== 1 ? "s" : ""} (Page {pagination?.page} of {pagination?.pages})
          </h3>
          <ul className="document-list">
            {results.map((doc, idx) => (
              <li key={doc.documentId || idx} className="result-item">
                <div style={{ flex: 1 }}>
                  <div className="result-item-title">📄 {doc.documentName}</div>
                  {doc.snippet && (
                    <div className="result-item-snippet">
                      ...{highlightText(doc.snippet, query)}...
                    </div>
                  )}
                  <div style={{ fontSize: "0.85rem", color: "#999", marginTop: "8px", display: "flex", gap: "15px" }}>
                    <span>🎯 {doc.matches} match{doc.matches !== 1 ? "es" : ""}</span>
                    <span>📅 {new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {pagination && pagination.pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => handleSearch(pagination.page - 1)}
                disabled={pagination.page === 1}
                style={{ opacity: pagination.page === 1 ? 0.5 : 1 }}
              >
                ← Previous
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSearch(p)}
                  style={{
                    background: p === pagination.page ? "#667eea" : "white",
                    color: p === pagination.page ? "white" : "#333",
                    border: "1px solid #ddd",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handleSearch(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                style={{ opacity: pagination.page === pagination.pages ? 0.5 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
