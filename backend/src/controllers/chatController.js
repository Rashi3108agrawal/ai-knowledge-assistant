const Document = require("../models/document");
const Chat = require("../models/chat");
const { summarizeText } = require("../utils/ai");
const { getEmbedding, cosineSimilarity } = require("../utils/embeddings");

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

    // 🔍 Retrieval step: embed the question, then find the chunks whose
    // embeddings are most similar to it. This is the "R" in RAG — instead of
    // guessing relevance from literal keyword overlap, we compare meaning.
    let context = "Answer not found in document.";
    if (document.chunks && document.chunks.length > 0) {
      const questionEmbedding = await getEmbedding(question);

      const ranked = document.chunks
        .map((chunk) => ({
          text: chunk.text,
          score: cosineSimilarity(questionEmbedding, chunk.embedding),
        }))
        .sort((a, b) => b.score - a.score);

      const topChunks = ranked.slice(0, 3).map((c) => c.text);
      if (topChunks.length > 0) {
        context = topChunks.join("\n");
      }
    }

    // 🤖 Augmented generation step: send the retrieved context to the model
    // to produce the final answer, grounded in the document instead of the
    // model's general knowledge alone.
    let answer = context;
    try {
      answer = await summarizeText(
        `Question: ${question}\nContext: ${context}\n\nAnswer the question using only the context above. If the context doesn't contain the answer, say so.`
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