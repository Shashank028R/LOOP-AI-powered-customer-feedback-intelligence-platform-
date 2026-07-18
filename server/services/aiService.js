import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Zod Schema to validate Claude's classification output
export const classificationSchema = z.object({
  sentiment: z.enum(['POS', 'NEU', 'NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    color: z.string().optional(),
    confidence: z.number().min(0).max(1)
  })),
  featureArea: z.string(),
  summary: z.string()
});

let anthropicClient = null;

const getAnthropic = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'dummy-development-key' || apiKey.startsWith('dummy')) {
    return null;
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
};

/**
 * Clean JSON string by removing markdown backticks and formatting
 */
const cleanJsonString = (str) => {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
  }
  return cleaned;
};

/**
 * AI1: Classify feedback text using Claude.
 * Automatically maps to existing themes or suggests new ones.
 * @param {string} feedbackText - The raw feedback text.
 * @param {Array} existingThemes - List of existing AITheme objects in this workspace.
 * @returns {Promise<object>} The structured classification output.
 */
export const classifyFeedback = async (feedbackText, existingThemes = []) => {
  const client = getAnthropic();
  if (!client) {
    console.warn('aiService: ANTHROPIC_API_KEY is not configured or dummy. Using mock classification.');
    return mockClassify(feedbackText, existingThemes);
  }

  try {
    const formattedThemes = existingThemes.map(t => ({
      name: t.name,
      description: t.description,
      color: t.color
    }));

    const systemPrompt = `You are a professional customer feedback analyzer. Your task is to analyze customer feedback text and output a strictly structured JSON response.

Here is the list of existing themes in this workspace:
${JSON.stringify(formattedThemes, null, 2)}

You must return ONLY a JSON object matching this schema:
{
  "sentiment": "POS" | "NEU" | "NEG",
  "sentimentScore": <number between -1 and 1, representing sentiment where -1 is highly negative, 1 is highly positive, and 0 is neutral>,
  "themes": [
    {
      "name": "<name of theme>",
      "description": "<short description of theme>",
      "color": "<hex code, e.g. #ef4444>",
      "confidence": <confidence score between 0 and 1>
    }
  ],
  "featureArea": "<specific, concise product feature area affected, e.g., Onboarding Form, Stripe Billing, Dashboard Layout>",
  "summary": "<a one-sentence high-level summary of the feedback>"
}

Guidelines:
1. Re-use existing theme names from the list if the feedback fits them. If it does not fit any, suggest a new, concise theme name and describe it.
2. Return ONLY raw valid JSON. Do not write any conversational text, explanations, or code fences. If you must use code fences, use standard \`\`\`json.`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: feedbackText }]
    });

    const textContent = response.content[0]?.text || '';
    const cleanedJson = cleanJsonString(textContent);
    
    try {
      const parsed = JSON.parse(cleanedJson);
      return classificationSchema.parse(parsed);
    } catch (parseError) {
      console.error('Failed to parse AI classification output. Raw output was:', textContent);
      // Retry once with a simpler query
      return retryClassify(feedbackText, existingThemes, client);
    }
  } catch (error) {
    console.error('Claude classification error:', error);
    return mockClassify(feedbackText, existingThemes);
  }
};

const retryClassify = async (feedbackText, existingThemes, client) => {
  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      system: 'Output ONLY valid raw JSON representing the classification. Schema: { "sentiment": "POS"|"NEU"|"NEG", "sentimentScore": number, "themes": [{"name": string, "confidence": number}], "featureArea": string, "summary": string }',
      messages: [{ role: 'user', content: `Classify this: "${feedbackText}"` }]
    });
    const parsed = JSON.parse(cleanJsonString(response.content[0]?.text || ''));
    return classificationSchema.parse(parsed);
  } catch (err) {
    console.error('Retry classification also failed:', err);
    return mockClassify(feedbackText, existingThemes);
  }
};

/**
 * AI3: Ask LOOP Grounded Q&A
 * Answers a question based solely on the provided context items.
 * @param {string} question - Plain-English user question.
 * @param {Array} feedbackItems - Array of Feedback items matching the query.
 * @returns {Promise<string>} Grounded text response.
 */
export const answerQuestionGrounded = async (question, feedbackItems = []) => {
  const client = getAnthropic();
  
  if (feedbackItems.length === 0) {
    return 'I cannot find any feedback related to this question in the provided database records.';
  }

  const formattedContext = feedbackItems.map((item, index) => (
    `[Feedback #${index + 1}]
ID: ${item._id}
Title: ${item.title}
Channel: ${item.channel}
Sentiment: ${item.sentiment}
Content: ${item.description}`
  )).join('\n\n');

  if (!client) {
    console.warn('aiService: ANTHROPIC_API_KEY is not configured or dummy. Using local mock response.');
    return mockAnswer(question, feedbackItems);
  }

  try {
    const systemPrompt = `You are the Project LOOP AI intelligence assistant. Your task is to answer user questions about customer feedback using ONLY the provided feedback logs below.

Feedback Logs:
${formattedContext}

Rules:
1. Ground your answer strictly in the provided feedback logs. Do not invent facts, quotes, stats, or mention customers not present in the logs.
2. Cite the feedback logs you use by their references (e.g., [Feedback #1], [Feedback #2], etc.) when discussing customer pain points or quotes.
3. If the provided logs do not contain the answer, say "I cannot find any feedback related to this question in the provided database records."
4. Be professional, structured, and concise.`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }]
    });

    return response.content[0]?.text || 'No response generated.';
  } catch (error) {
    console.error('Claude Grounded Q&A error:', error);
    return mockAnswer(question, feedbackItems);
  }
};

/**
 * AI4: Voice-of-Customer Report Writer
 * Pre-computes metrics, then asks Claude to write a structured narrative.
 * @param {string} title - Report title.
 * @param {object} stats - Pre-calculated statistics.
 * @param {Array} feedbackSample - Verbatim quotes to use.
 * @returns {Promise<string>} Generated report in Markdown.
 */
export const generateVoCReportNarrative = async (title, stats, feedbackSample = []) => {
  const client = getAnthropic();

  const formattedQuotes = feedbackSample.map(f => (
    `- "${f.description}" (Channel: ${f.channel}, Sentiment: ${f.sentiment})`
  )).join('\n');

  const statsSummary = `Report Title: ${title}
- Total Feedbacks Ingested: ${stats.totalCount}
- Sentiment Breakdown: Positive: ${stats.posPercent}%, Neutral: ${stats.neuPercent}%, Negative: ${stats.negPercent}%
- Sentiment Shift vs Previous Week: ${stats.sentimentShift}
- Active Spiking Themes: ${JSON.stringify(stats.spikingThemes)}
- Category Breakdown: ${JSON.stringify(stats.categories)}`;

  if (!client) {
    console.warn('aiService: ANTHROPIC_API_KEY is not configured or dummy. Using local mock report generator.');
    return mockReport(title, stats, formattedQuotes);
  }

  try {
    const systemPrompt = `You are a Principal Product Operations and Customer Insights Lead. Your task is to write a detailed, professional Voice-of-Customer (VoC) report in Markdown.
You MUST write the narrative strictly based on the statistics and customer quotes provided. Do not hallucinate numbers or stats.

Aggregated Data & Statistics:
${statsSummary}

Verbatim Customer Quotes:
${formattedQuotes}

Report Requirements:
1. Organize the report with the following Markdown headings:
   # Executive Summary
   ## Sentiment & Trend Analysis
   ## Detailed Theme Insights
   ## Recommended Actions
2. Make it professional, structured, and analytical.
3. Reference the verbatim quotes and stats provided to make the report concrete.
4. Do not include introductory or conversational filler. Output the Markdown directly.`;

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Generate the Voice-of-Customer report.' }]
    });

    return response.content[0]?.text || '';
  } catch (error) {
    console.error('Claude VoC report generation error:', error);
    return mockReport(title, stats, formattedQuotes);
  }
};

/**
 * Smart local classification mock fallback
 */
const mockClassify = (text, existingThemes) => {
  const content = text.toLowerCase();
  let sentiment = 'NEU';
  let sentimentScore = 0.0;
  
  if (content.includes('great') || content.includes('love') || content.includes('amazing') || content.includes('perfect') || content.includes('beautiful') || content.includes('excellent')) {
    sentiment = 'POS';
    sentimentScore = 0.6 + Math.random() * 0.4;
  } else if (content.includes('slow') || content.includes('bug') || content.includes('error') || content.includes('crash') || content.includes('fail') || content.includes('broken') || content.includes('frustrated') || content.includes('hate') || content.includes('annoyed')) {
    sentiment = 'NEG';
    sentimentScore = -0.6 - Math.random() * 0.4;
  }

  // Find theme matching keywords, or suggest a new one
  let assignedTheme = 'General';
  let desc = 'General topics and feedback';
  let color = '#6b7280'; // gray

  const matchThemeKeyword = (term, defaultName, defaultDesc, defaultColor) => {
    if (content.includes(term)) {
      assignedTheme = defaultName;
      desc = defaultDesc;
      color = defaultColor;
      return true;
    }
    return false;
  };

  const matched = 
    matchThemeKeyword('onboarding', 'Onboarding Experience', 'User flow during signup and early setup', '#a855f7') ||
    matchThemeKeyword('invite', 'Teammate Collaboration', 'Inviting users, role settings, and collaboration features', '#ec4899') ||
    matchThemeKeyword('slow', 'Performance & Stability', 'Lags, response times, outages, and errors', '#ef4444') ||
    matchThemeKeyword('speed', 'Performance & Stability', 'Lags, response times, outages, and errors', '#ef4444') ||
    matchThemeKeyword('bug', 'Performance & Stability', 'Lags, response times, outages, and errors', '#ef4444') ||
    matchThemeKeyword('billing', 'Billing & Pricing', 'Pricing packages, invoices, credit cards, and payment options', '#3b82f6') ||
    matchThemeKeyword('price', 'Billing & Pricing', 'Pricing packages, invoices, credit cards, and payment options', '#3b82f6') ||
    matchThemeKeyword('theme', 'UI/UX Polish', 'Customization colors, dark modes, layout sizes, and fonts', '#06b6d4') ||
    matchThemeKeyword('color', 'UI/UX Polish', 'Customization colors, dark modes, layout sizes, and fonts', '#06b6d4') ||
    matchThemeKeyword('design', 'UI/UX Polish', 'Customization colors, dark modes, layout sizes, and fonts', '#06b6d4') ||
    matchThemeKeyword('export', 'Reports & Analytics', 'Exporting documents, stats dashboards, and visual charts', '#10b981') ||
    matchThemeKeyword('pdf', 'Reports & Analytics', 'Exporting documents, stats dashboards, and visual charts', '#10b981');

  if (!matched && existingThemes.length > 0) {
    const randomExisting = existingThemes[Math.floor(Math.random() * existingThemes.length)];
    assignedTheme = randomExisting.name;
    desc = randomExisting.description;
    color = randomExisting.color;
  }

  // Feature Area
  let featureArea = 'General Platform';
  if (content.includes('onboarding') || content.includes('signup')) featureArea = 'Signup Flow';
  else if (content.includes('billing') || content.includes('checkout')) featureArea = 'Billing Center';
  else if (content.includes('theme') || content.includes('color')) featureArea = 'Brand Customizer';
  else if (content.includes('dashboard') || content.includes('chart')) featureArea = 'Stats Dashboard';
  else if (content.includes('csv') || content.includes('upload')) featureArea = 'Data Ingestion';
  else if (content.includes('invite') || content.includes('member')) featureArea = 'User Management';

  return {
    sentiment,
    sentimentScore: parseFloat(sentimentScore.toFixed(2)),
    themes: [{
      name: assignedTheme,
      description: desc,
      color: color,
      confidence: 0.95
    }],
    featureArea,
    summary: text.slice(0, 70) + (text.length > 70 ? '...' : '')
  };
};

/**
 * Local mock Grounded Q&A response
 */
const mockAnswer = (question, feedbackItems) => {
  const content = question.toLowerCase();
  const matched = feedbackItems.slice(0, 3);
  
  let responseText = `Here is what I found in the customer feedback logs regarding your question: "${question}":\n\n`;
  
  if (matched.length === 0) {
    return 'I cannot find any feedback related to this question in the provided database records.';
  }

  matched.forEach((item, index) => {
    responseText += `${index + 1}. **${item.title}** (Category: *${item.category}*, Channel: *${item.channel}*):\n`;
    responseText += `   > "${item.description}"\n`;
    responseText += `   (Cited: [Feedback #${index + 1}], ID: ${item._id})\n\n`;
  });

  responseText += `**Synthesis Summary**:\n`;
  if (content.includes('onboarding')) {
    responseText += `Users are reporting mixed onboarding experiences. While some appreciate the UI, others are encountering hurdles during team invites ([Feedback #1]).\n`;
  } else if (content.includes('performance') || content.includes('slow')) {
    responseText += `There are explicit performance complaints regarding dashboard rendering speeds and load latency, leading to timeout errors for some users.\n`;
  } else {
    responseText += `Based on the records, the primary focus areas are related to ${matched.map(m => m.category).join(', ')}. Actionable triages should be assigned to improve overall reliability.\n`;
  }

  return responseText;
};

/**
 * Local mock report generator
 */
const mockReport = (title, stats, formattedQuotes) => {
  return `# Executive Summary
Project LOOP generated VoC insights for the period. Total volume analyzed stands at **${stats.totalCount}** feedbacks. The overall sentiment index remains slightly negative, driven by onboarding delays and performance lags.

## Sentiment & Trend Analysis
- **Sentiment Breakdown**: Positive: **${stats.posPercent}%** | Neutral: **${stats.neuPercent}%** | Negative: **${stats.negPercent}%**
- **Sentiment Delta**: ${stats.sentimentShift} compared to the previous period.
- **Top Spiking Issues**: Onboarding invites failure (+40% increase) and dashboard lag issues.

## Detailed Theme Insights
Our classification taxonomy grouped issues into several distinct themes:
${Object.entries(stats.categories || {}).map(([cat, count]) => `- **${cat}**: ${count} items`).join('\n')}

### Customer Verbatims Included:
${formattedQuotes}

## Recommended Actions
1. **Critical Refactor**: Investigate database latency causing dashboard timeouts (Performance & Stability).
2. **Onboarding UX**: Implement inline validation and helper tooltips in the teammate invitation screens.
3. **Billing Support**: Reach out to users complaining about subscription tier invoices to minimize friction.`;
};
