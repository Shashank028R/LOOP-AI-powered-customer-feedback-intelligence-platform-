/**
 * Service to handle Anthropic Claude API calls for feedback classification.
 * This is prepared to automatically categorize user feedback into structured
 * taxonomy nodes and tags once active credentials and prompt flows are wired.
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Classify feedback text using Claude.
 * @param {string} feedbackText - The raw feedback text from the user.
 * @returns {Promise<object>} The classified feedback details (e.g., tag, sentiment, urgency).
 */
export const classifyFeedback = async (feedbackText) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'dummy-development-key') {
      console.warn('aiService: ANTHROPIC_API_KEY is not configured. Returning mock classification.');
      return mockClassify(feedbackText);
    }

    // TODO: Initialize Anthropic SDK and invoke messages.create()
    // import Anthropic from '@anthropic-ai/sdk';
    // const anthropic = new Anthropic({ apiKey });
    // const response = await anthropic.messages.create({
    //   model: 'claude-3-5-sonnet-latest',
    //   max_tokens: 1024,
    //   messages: [{ role: 'user', content: '...' }]
    // });

    return {
      category: 'Feature Request',
      sentiment: 'Positive',
      urgency: 'Medium',
      tags: ['ui', 'ux'],
      summary: 'User requests updates regarding custom branding/themes.'
    };
  } catch (error) {
    console.error('Error during Claude classification:', error);
    throw error;
  }
};

/**
 * Fallback local mockup classification logic
 */
const mockClassify = (text) => {
  const content = text.toLowerCase();
  let category = 'General';
  let tags = [];

  if (content.includes('slow') || content.includes('crash') || content.includes('bug') || content.includes('error')) {
    category = 'Bug Report';
    tags = ['performance', 'stability'];
  } else if (content.includes('add') || content.includes('feature') || content.includes('want') || content.includes('button')) {
    category = 'Feature Request';
    tags = ['enhancement'];
  } else if (content.includes('billing') || content.includes('price') || content.includes('pay')) {
    category = 'Billing';
    tags = ['pricing'];
  }

  return {
    category,
    sentiment: 'Neutral',
    urgency: category === 'Bug Report' ? 'High' : 'Low',
    tags,
    summary: text.slice(0, 100) + (text.length > 100 ? '...' : '')
  };
};
