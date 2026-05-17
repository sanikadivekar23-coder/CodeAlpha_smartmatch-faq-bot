/**
 * Simple English Tokenizer
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

/**
 * Very basic Porter-style stemmer logic
 */
export function stem(word: string): string {
  if (word.length < 3) return word;
  
  let stemmed = word;
  
  // Basic suffixes
  if (stemmed.endsWith('ies') && !stemmed.endsWith('eies')) stemmed = stemmed.slice(0, -3) + 'i';
  else if (stemmed.endsWith('s') && !stemmed.endsWith('ss')) stemmed = stemmed.slice(0, -1);
  
  if (stemmed.endsWith('ing')) {
    const base = stemmed.slice(0, -3);
    if (base.length > 2) stemmed = base;
  }
  
  if (stemmed.endsWith('ed')) {
    const base = stemmed.slice(0, -2);
    if (base.length > 2) stemmed = base;
  }

  if (stemmed.endsWith('ly')) stemmed = stemmed.slice(0, -2);
  
  return stemmed;
}

// Simple list of common English stopwords
const stopwords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"
]);

/**
 * Preprocesses text: Lowercasing, Tokenization, Stopword Removal, Stemming
 */
export function preprocess(text: string): string[] {
  const tokens = tokenize(text);
  
  return tokens
    .filter(token => !stopwords.has(token))
    .map(token => stem(token));
}

/**
 * Computes the cosine similarity between two word frequency vectors
 */
export function cosineSimilarity(vec1: Record<string, number>, vec2: Record<string, number>): number {
  const keys1 = Object.keys(vec1);
  const keys2 = Object.keys(vec2);
  
  const intersection = keys1.filter(word => keys2.includes(word));
  
  let dotProduct = 0;
  for (const word of intersection) {
    dotProduct += vec1[word] * vec2[word];
  }
  
  let mag1 = 0;
  for (const word of keys1) {
    mag1 += vec1[word] ** 2;
  }
  
  let mag2 = 0;
  for (const word of keys2) {
    mag2 += vec2[word] ** 2;
  }
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Converts preprocessed tokens into a frequency map (bag of words)
 */
export function getVector(tokens: string[]): Record<string, number> {
  const vector: Record<string, number> = {};
  for (const token of tokens) {
    vector[token] = (vector[token] || 0) + 1;
  }
  return vector;
}
