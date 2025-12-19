const Note = require("../models/note");

exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, documentId } = req.body;

    const note = await Note.create({
      userId: req.userId,
      documentId: documentId || null,
      title,
      content,
      tags,
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId })
      .populate("documentId", "name")
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotesByDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const notes = await Note.find({
      userId: req.userId,
      documentId: documentId,
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, tags, documentId } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: req.userId },
      { title, content, tags, documentId: documentId || null },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: req.userId,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { q, tag } = req.query;

    let filter = { userId: req.userId };

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

