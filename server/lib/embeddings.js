import { pipeline } from '@xenova/transformers';

let extractor = null;

/**
 * Generate a 384-dimensional vector embedding for a given text locally.
 * Falls back to a mock normalized vector on failure to ensure offline stability.
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export const getEmbedding = async (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Input text must be a valid string');
    }

    if (!extractor) {
      console.log('Initializing local sentence transformer (Xenova/all-MiniLM-L6-v2)...');
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('Error generating local embedding:', error);
    console.warn('Embedding service: Using random vector fallback.');
    
    // Generate a fallback 384-dimensional unit vector
    const fallback = Array.from({ length: 384 }, () => Math.random() * 2 - 1);
    const magnitude = Math.sqrt(fallback.reduce((sum, val) => sum + val * val, 0));
    return fallback.map(val => val / (magnitude || 1));
  }
};

/**
 * Compute the cosine similarity between two vectors.
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number}
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
