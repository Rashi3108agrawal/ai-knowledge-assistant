import React, { useState, useEffect, useRef } from "react";
import { askQuestion, getDocuments } from "../api/api";
import ReactMarkdown from "react-markdown";

export default function ChatPage({ token }) {
  const [documentId, setDocumentId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [question, setQuestion] = useState("");
  const [chatLogs, setChatLogs] = useState({}); // Store chat per document
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await getDocuments(token);
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to fetch documents:", err);
      }
    };
    if (token) fetchDocs();
  }, [token]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatLogs, documentId, loading]);

  const handleAsk = async () => {
    if (!question || !documentId) return;

    const newMessage = { question, answer: null, isLoading: true };
    setChatLogs((prev) => ({
      ...prev,
      [documentId]: [...(prev[documentId] || []), newMessage],
    }));
    setQuestion("");
    setLoading(true);

    try {
      const res = await askQuestion({ documentId, question }, token);
      const answer = res.data.answer || "Answer not found in document.";
      setChatLogs((prev) => {
        const logs = [...(prev[documentId] || [])];
        logs[logs.length - 1].answer = answer;
        logs[logs.length - 1].isLoading = false;
        return { ...prev, [documentId]: logs };
      });
    } catch (err) {
      console.error(err);
      setChatLogs((prev) => {
        const logs = [...(prev[documentId] || [])];
        logs[logs.length - 1].answer = "❌ Error getting answer";
        logs[logs.length - 1].isLoading = false;
        return { ...prev, [documentId]: logs };
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (documentId) {
      setChatLogs((prev) => ({
        ...prev,
        [documentId]: [],
      }));
    }
  };

  const currentChat = chatLogs[documentId] || [];

  return (
    <div className="card">
      <h2>💬 Document Chat</h2>
      <label>Select a Document:</label>
      <select
        value={documentId}
        onChange={(e) => setDocumentId(e.target.value)}
      >
        <option value="">-- Choose a document --</option>
        {documents.map((doc) => (
          <option key={doc._id} value={doc._id}>
            {doc.name}
          </option>
        ))}
      </select>

      {documentId && (
        <>
          <label style={{ marginTop: "20px" }}>Your Question:</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <textarea
              placeholder="Ask a question about the document..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handleAsk();
              }}
              style={{ flex: 1, minHeight: "80px" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleAsk} disabled={!question || loading}>
              {loading ? "⏳ AI is thinking..." : "Ask Question"}
            </button>
            {currentChat.length > 0 && (
              <button 
                onClick={clearChat}
                style={{ background: "#dc3545" }}
              >
                🗑️ Clear Chat
              </button>
            )}
          </div>

          {currentChat.length > 0 && (
            <div className="chat-container" ref={chatContainerRef}>
              {currentChat.map((entry, idx) => (
                <div key={idx}>
                  <div className="chat-entry question">
                    <strong>Q:</strong> {entry.question}
                  </div>
                  <div className="chat-entry answer">
                    <strong>A:</strong>
                    {entry.isLoading ? (
                      <span style={{ fontStyle: "italic", color: "#999" }}>
                        ⏳ AI is thinking...
                      </span>
                    ) : (
                      <div style={{ marginTop: "8px" }}>
                        <ReactMarkdown
                          components={{
                            code: ({ inline, children }) =>
                              inline ? (
                                <code style={{
                                  background: "#f0f0f0",
                                  padding: "2px 6px",
                                  borderRadius: "3px",
                                  fontFamily: "monospace"
                                }}>
                                  {children}
                                </code>
                              ) : (
                                <pre style={{
                                  background: "#f0f0f0",
                                  padding: "10px",
                                  borderRadius: "5px",
                                  overflow: "auto",
                                  marginTop: "8px"
                                }}>
                                  <code>{children}</code>
                                </pre>
                              ),
                            ul: ({ children }) => (
                              <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol style={{ marginLeft: "20px", marginTop: "8px" }}>
                                {children}
                              </ol>
                            ),
                          }}
                        >
                          {entry.answer}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
