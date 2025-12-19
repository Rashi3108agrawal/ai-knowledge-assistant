const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadPDF, searchDocuments, semanticSearchDocs, getDocuments } = require("../controllers/documentController");


router.get("/", auth, getDocuments);

router.post("/upload", auth, upload.single("pdf"), uploadPDF);

router.get("/search", auth, searchDocuments);

router.post("/semantic-search", auth, semanticSearchDocs);

module.exports = router;
