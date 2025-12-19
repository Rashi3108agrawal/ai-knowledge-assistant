const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const documentRoutes = require("./routes/documentRoutes");
app.use("/api/document", documentRoutes);

const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chat", chatRoutes);

const noteRoutes = require("./routes/noteRoutes");
app.use("/api/notes", noteRoutes);

module.exports = app;
