const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    title: String,
    content: String,
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
