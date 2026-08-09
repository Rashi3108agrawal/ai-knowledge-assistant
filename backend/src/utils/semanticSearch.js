const { getEmbedding, cosineSimilarity } = require("./embeddings");

// Real semantic search: embeds the query, then compares it against every stored
// chunk embedding using cosine similarity. Returns the best-matching chunks
// across all of the user's documents, ranked by similarity score.
//
// This replaces the previous TF-IDF (keyword-frequency) implementation, which
// matched on literal word overlap and wasn't actually "semantic" — it couldn't
// tell that a query about "revenue" was related to a document about "income".
async function semanticSearch(documents, query, topK = 5) {
  const queryEmbedding = await getEmbedding(query);

  const scored = [];
  for (const doc of documents) {
    for (const chunk of doc.chunks || []) {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      scored.push({
        document: doc,
        chunkText: chunk.text,
        score,
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

module.exports = { semanticSearch };