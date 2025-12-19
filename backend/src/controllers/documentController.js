const pdfParse = require("pdf-parse");
const Document = require("../models/document");
const { chunkText } = require("../utils/chunker");
const { summarizeText } = require("../utils/ai");

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId })
      .select("_id name createdAt summary")
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check for duplicate file
    const existingDoc = await Document.findOne({
      userId: req.userId,
      name: req.file.originalname,
    });

    if (existingDoc) {
      return res.status(400).json({
        message: "This PDF has already been uploaded. Please use the existing file or upload a different one.",
        documentId: existingDoc._id,
      });
    }

    // 1️⃣ Extract text from PDF
    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);

    // 2️⃣ Chunk text (token safe)
    const chunks = chunkText(data.text);

    // 3️⃣ Generate AI summary
    let finalSummary = "";
    try {
      for (const chunk of chunks) {
        const chunkSummary = await summarizeText(chunk);
        finalSummary += chunkSummary + "\n";
      }
    } catch (err) {
      console.error("AI summary failed, using fallback");
      finalSummary = "AI summary temporarily unavailable. Please try again later.";
    }

    // 4️⃣ Save to DB
    const document = await Document.create({
      userId: req.userId,
      name: req.file.originalname,
      text: data.text,
      summary: finalSummary,
    });

    res.status(201).json({
      message: "PDF uploaded & summarized",
      documentId: document._id,
      name: document.name,
      uploadedAt: document.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.searchDocuments = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ message: "Query is required" });
    }

    const skip = (page - 1) * limit;

    const documents = await Document.find({
      userId: req.userId,
      text: { $regex: q, $options: "i" },
    })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Document.countDocuments({
      userId: req.userId,
      text: { $regex: q, $options: "i" },
    });

    const results = documents.map((doc) => {
      const count = (doc.text.match(new RegExp(q, "gi")) || []).length;
      const index = doc.text.toLowerCase().indexOf(q.toLowerCase());

      const snippet =
        index !== -1
          ? doc.text.substring(Math.max(0, index - 50), index + 100)
          : "";

      return {
        documentId: doc._id,
        documentName: doc.name,
        matches: count,
        snippet,
        createdAt: doc.createdAt,
      };
    });

    // sort by relevance
    results.sort((a, b) => b.matches - a.matches);

    res.json({
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { semanticSearch } = require("../utils/semanticSearch");

exports.semanticSearchDocs = async (req, res) => {
  try {
    const { query } = req.body;

    const documents = await Document.find({ userId: req.userId });

    const results = semanticSearch(documents, query);

    res.json(
      results.map(r => ({
        documentId: r.document._id,
        name: r.document.name,
        score: r.score,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

