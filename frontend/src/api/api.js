import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Auth
export const registerUser = (data) => api.post("/auth/signup", data);
export const loginUser = (data) => api.post("/auth/login", data);

// Add JWT token automatically if stored
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Documents
export const uploadPDF = (formData, token) =>
  api.post("/document/upload", formData, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
  });

export const getDocuments = (token) =>
  api.get("/document", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const searchDocuments = (query, token, page = 1, limit = 5) =>
  api.get(`/document/search?q=${query}&page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Chat
export const askQuestion = (data, token) =>
  api.post("/chat/ask", data, { headers: { Authorization: `Bearer ${token}` } });

// Notes
export const saveNote = (data, token) =>
  api.post("/notes", data, { headers: { Authorization: `Bearer ${token}` } });

export const fetchNotes = (token) =>
  api.get("/notes", { headers: { Authorization: `Bearer ${token}` } });

export const getNotesByDocument = (documentId, token) =>
  api.get(`/notes/document/${documentId}`, { headers: { Authorization: `Bearer ${token}` } });

export const updateNote = (noteId, data, token) =>
  api.put(`/notes/${noteId}`, data, { headers: { Authorization: `Bearer ${token}` } });

export const deleteNote = (noteId, token) =>
  api.delete(`/notes/${noteId}`, { headers: { Authorization: `Bearer ${token}` } });

export default api;
