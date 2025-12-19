const natural = require("natural");
const TfIdf = natural.TfIdf;

exports.semanticSearch = (documents, query) => {
  const tfidf = new TfIdf();

  documents.forEach(doc => {
    tfidf.addDocument(doc.text);
  });

  let scores = [];

  tfidf.tfidfs(query, (i, measure) => {
    scores.push({
      document: documents[i],
      score: measure,
    });
  });

  return scores
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
};
