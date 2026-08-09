const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    embedding: { type: [Number], required: true }, // vector from OpenAI embeddings
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    text: { type: String, required: true }, // full extracted text, kept for reference
    chunks: { type: [chunkSchema], default: [] }, // chunk-level text + embeddings for semantic search
    createdAt: { type: Date, default: Date.now },
    summary: {
      type: String,
    },
  }
);

module.exports = mongoose.model("Document", documentSchema);