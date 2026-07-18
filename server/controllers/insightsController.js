import Feedback from '../models/Feedback.js';
import { getEmbedding, cosineSimilarity } from '../lib/embeddings.js';
import { answerQuestionGrounded } from '../services/aiService.js';

/**
 * Ask LOOP Grounded Q&A (RAG Pipeline)
 */
export const askLOOP = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, message: 'Question text is required' });
    }

    const workspaceId = req.user.workspaceId;

    // 1. Get embedding for the question
    console.log(`Generating embedding for question: "${question}"`);
    const questionVector = await getEmbedding(question);

    // 2. Load feedbacks that have embeddings
    const feedbacks = await Feedback.find({ 
      workspaceId, 
      embedding: { $exists: true, $ne: null } 
    }).populate('userId', 'name role');

    let scoredFeedbacks = [];

    if (feedbacks.length > 0) {
      // 3. Compute cosine similarity for each feedback
      scoredFeedbacks = feedbacks.map(item => {
        const similarity = cosineSimilarity(questionVector, item.embedding);
        return {
          item,
          similarity
        };
      });

      // Sort by similarity descending
      scoredFeedbacks.sort((a, b) => b.similarity - a.similarity);
    } else {
      // Fallback: If no embeddings, do a simple text search or keyword search
      console.warn('No vector embeddings found in database. Using text search fallback.');
      const keywords = question.split(' ').filter(w => w.length > 3);
      const textMatches = await Feedback.find({
        workspaceId,
        $or: [
          { title: { $regex: keywords.join('|'), $options: 'i' } },
          { description: { $regex: keywords.join('|'), $options: 'i' } }
        ]
      }).limit(10).populate('userId', 'name role');
      
      scoredFeedbacks = textMatches.map(item => ({ item, similarity: 0.5 }));
    }

    // 4. Select top-K feedback logs (e.g. top 6 logs)
    const topKMatches = scoredFeedbacks.slice(0, 6);
    const feedbackContextList = topKMatches.map(sf => sf.item);

    // 5. Invoke Claude with context grounding
    console.log(`Querying Claude grounding context using ${feedbackContextList.length} feedback items`);
    const answer = await answerQuestionGrounded(question, feedbackContextList);

    // 6. Return response with cited source logs
    res.json({
      success: true,
      answer,
      citations: feedbackContextList.map(item => ({
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        channel: item.channel,
        sentiment: item.sentiment,
        category: item.category,
        author: item.userId ? item.userId.name : 'Unknown',
        date: item.createdAt.toISOString().split('T')[0]
      }))
    });
  } catch (error) {
    console.error('Error in askLOOP controller:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
