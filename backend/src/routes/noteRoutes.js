const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { 
  createNote, 
  getNotes, 
  getNotesByDocument,
  updateNote, 
  deleteNote, 
  searchNotes 
} = require("../controllers/noteController");

router.post("/", auth, createNote);
router.get("/", auth, getNotes);
router.get("/search", auth, searchNotes);
router.get("/document/:documentId", auth, getNotesByDocument);
router.put("/:noteId", auth, updateNote);
router.delete("/:noteId", auth, deleteNote);

module.exports = router;
