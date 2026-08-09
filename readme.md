# AI Knowledge Assistant

A full-stack app that lets you upload PDF documents and ask natural-language questions about them, backed by a real retrieval-augmented generation (RAG) pipeline — not just a wrapper around a single OpenAI call.

🔗 **Live demo:** [add once deployed]

## What it does

- Upload a PDF — it's parsed, chunked, and summarized automatically
- Ask questions about a document and get answers grounded in its actual content (RAG: retrieve relevant chunks by embedding similarity, then generate an answer from that context)
- Semantic search across your documents using OpenAI embeddings + cosine similarity — finds conceptually related content, not just keyword matches
- Basic keyword search as a secondary, simpler search mode
- Notes and auth (JWT + bcrypt) to keep documents scoped per user

## Tech stack

- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **AI:** OpenAI API — `gpt-4o-mini` for summarization/answers, `text-embedding-3-small` for retrieval
- **Frontend:** React (Vite), React Router
- **Auth:** JWT, bcrypt

## How the RAG pipeline works

1. On upload, the PDF is parsed and split into ~2000-character chunks
2. Each chunk is embedded via OpenAI's embedding model and stored alongside its text
3. When a question comes in, the question itself is embedded
4. The chunks with the highest cosine similarity to the question's embedding are retrieved
5. Those chunks are passed as context to the model to generate a grounded answer

## Running locally

```bash
# Backend
cd backend
npm install
cp .env.example .env   # add your MongoDB URI, JWT secret, and OpenAI API key
npm run dev             # or: node index.js

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## What I'd improve next

- Batch re-embedding for existing documents if the embedding model changes
- Chunk overlap (currently chunks are split with no overlap, which can cut answers off mid-context)
- Vector index in MongoDB Atlas (or a dedicated vector DB) instead of in-memory cosine similarity, for scale beyond a handful of documents