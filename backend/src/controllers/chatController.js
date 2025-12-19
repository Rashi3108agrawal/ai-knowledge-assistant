const Document = require("../models/document");
const Chat = require("../models/chat");
const { chunkText } = require("../utils/chunker");
const { summarizeText } = require("../utils/ai"); // optional AI

exports.askQuestion = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.userId,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // 🔍 Search relevant content
    const chunks = chunkText(document.text, 500);
   const keywords = question
  .toLowerCase()
  .replace(/[^a-z0-9 ]/g, "")
  .split(" ")
  .filter(word => word.length > 3);

const relevantChunks = chunks.filter(chunk =>
  keywords.some(word => chunk.toLowerCase().includes(word))
);


    let answer =
      relevantChunks.slice(0, 3).join("\n") ||
      "Answer not found in document.";

    // 🤖 Optional AI enhancement (safe)
    try {
      answer = await summarizeText(
        `Question: ${question}\nContext: ${answer}`
      );
    } catch (err) {
      console.log("AI skipped:", err.message);
    }

    const chat = await Chat.create({
      userId: req.userId,
      documentId,
      question,
      answer,
    });

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    const chats = await Chat.find({
      userId: req.userId,
      documentId,
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

