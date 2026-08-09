const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generates a vector embedding for a piece of text using OpenAI's embedding model.
// text-embedding-3-small is cheap and fast — good fit for a project like this.
async function getEmbedding(text) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

// Generates embeddings for multiple chunks in one batched API call — cheaper and
// faster than calling getEmbedding() once per chunk.
async function getEmbeddings(texts) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return response.data.map((item) => item.embedding);
}

// Standard cosine similarity between two equal-length vectors.
// Returns a value between -1 and 1; closer to 1 means more semantically similar.
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { getEmbedding, getEmbeddings, cosineSimilarity };