const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    text: { type: String, required: true }, // extracted text
    createdAt: { type: Date, default: Date.now },
    summary: {
  type: String,
},

  }
);

module.exports = mongoose.model("Document", documentSchema);
