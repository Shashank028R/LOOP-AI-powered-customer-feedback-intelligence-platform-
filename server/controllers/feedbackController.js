import Feedback from '../models/Feedback.js';
import AITheme from '../models/AITheme.js';
import { classifyFeedback } from '../services/aiService.js';
import { getEmbedding } from '../lib/embeddings.js';

// Get all feedbacks for workspace (Paginated + Filtered + Searched)
export const getFeedbacks = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      channel, 
      sentiment, 
      theme,
      startDate,
      endDate
    } = req.query;

    const query = { workspaceId };

    // Status filter
    if (status && status !== 'ALL') {
      query.status = status;
    }

    // Channel filter
    if (channel && channel !== 'ALL') {
      query.channel = channel;
    }

    // Sentiment filter
    if (sentiment && sentiment !== 'ALL') {
      query.sentiment = sentiment;
    }

    // Theme filter
    if (theme && theme !== 'ALL') {
      query['themes.themeId'] = theme;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        // Extend to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Full-text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { customerLabel: { $regex: search, $options: 'i' } },
        { featureArea: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const feedbacks = await Feedback.find(query)
      .populate('userId', 'name role')
      .populate('themes.themeId', 'name color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Feedback.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      feedbacks: feedbacks.map(fb => ({
        id: fb._id.toString(),
        title: fb.title,
        description: fb.description,
        channel: fb.channel,
        sourceRef: fb.sourceRef || `LOOP-${fb._id.toString().slice(-4).toUpperCase()}`,
        customerLabel: fb.customerLabel || 'General',
        sentiment: fb.sentiment,
        sentimentScore: fb.sentimentScore,
        status: fb.status,
        category: fb.category,
        themes: fb.themes.map(t => ({
          id: t.themeId?._id?.toString() || '',
          name: t.themeId?.name || 'General',
          color: t.themeId?.color || '#cbd5e1',
          confidence: t.confidence
        })),
        featureArea: fb.featureArea || 'General',
        aiSummary: fb.aiSummary || fb.description.slice(0, 100) + '...',
        author: fb.userId ? fb.userId.name : 'System Ingestion',
        role: fb.userId ? fb.userId.role : 'SYSTEM',
        date: fb.createdAt.toISOString().split('T')[0]
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a single feedback and run AI Classification + Local Embedding
export const createFeedback = async (req, res) => {
  try {
    const { title, description, channel, sourceRef, customerLabel } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const workspaceId = req.user.workspaceId;
    const userId = req.user._id;

    // Load existing AI themes to let Claude match them
    const existingThemes = await AITheme.find({ workspaceId });

    // 1. Classification
    console.log(`Ingesting single feedback: Running Claude classification...`);
    const aiClassification = await classifyFeedback(description, existingThemes);

    // 2. Theme mapping and creation
    const mappedThemes = [];
    for (const themeInfo of aiClassification.themes) {
      let dbTheme = await AITheme.findOne({ name: themeInfo.name, workspaceId });
      if (!dbTheme) {
        console.log(`Creating new theme node: "${themeInfo.name}"`);
        dbTheme = await AITheme.create({
          name: themeInfo.name,
          description: themeInfo.description || 'Auto-created AI theme',
          color: themeInfo.color || '#3b82f6',
          workspaceId
        });
      }
      mappedThemes.push({
        themeId: dbTheme._id,
        confidence: themeInfo.confidence || 1.0
      });
    }

    // 3. Local embedding generation
    console.log(`Computing local ONNX embedding vector...`);
    const embedding = await getEmbedding(description);

    // 4. Create document
    const feedback = await Feedback.create({
      title,
      description,
      channel: channel || 'Support ticket',
      sourceRef: sourceRef || `LOOP-${Math.floor(1000 + Math.random() * 9000)}`,
      customerLabel: customerLabel || 'General',
      sentiment: aiClassification.sentiment,
      sentimentScore: aiClassification.sentimentScore,
      status: 'NEW',
      category: aiClassification.themes[0]?.name || 'General',
      themes: mappedThemes,
      featureArea: aiClassification.featureArea,
      aiSummary: aiClassification.summary,
      embedding,
      userId,
      workspaceId
    });

    res.status(201).json({
      success: true,
      feedback: {
        id: feedback._id.toString(),
        title: feedback.title,
        description: feedback.description,
        status: feedback.status,
        category: feedback.category
      },
      aiAnalysis: aiClassification
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Inline status triage modifier
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['NEW', 'REVIEWED', 'ACTIONED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be NEW, REVIEWED, or ACTIONED' });
    }

    const feedback = await Feedback.findOne({ _id: req.params.id, workspaceId: req.user.workspaceId });
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    feedback.status = status;
    await feedback.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      feedback: {
        id: feedback._id.toString(),
        status: feedback.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Re-classify feedback endpoint
export const reclassifyFeedbackEndpoint = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const feedback = await Feedback.findOne({ _id: req.params.id, workspaceId });
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    const existingThemes = await AITheme.find({ workspaceId });
    console.log(`Re-classifying feedback ID: ${feedback._id}`);
    const aiClassification = await classifyFeedback(feedback.description, existingThemes);

    const mappedThemes = [];
    for (const themeInfo of aiClassification.themes) {
      let dbTheme = await AITheme.findOne({ name: themeInfo.name, workspaceId });
      if (!dbTheme) {
        dbTheme = await AITheme.create({
          name: themeInfo.name,
          description: themeInfo.description || 'Auto-created AI theme',
          color: themeInfo.color || '#3b82f6',
          workspaceId
        });
      }
      mappedThemes.push({
        themeId: dbTheme._id,
        confidence: themeInfo.confidence || 1.0
      });
    }

    const embedding = await getEmbedding(feedback.description);

    feedback.sentiment = aiClassification.sentiment;
    feedback.sentimentScore = aiClassification.sentimentScore;
    feedback.category = aiClassification.themes[0]?.name || 'General';
    feedback.themes = mappedThemes;
    feedback.featureArea = aiClassification.featureArea;
    feedback.aiSummary = aiClassification.summary;
    feedback.embedding = embedding;
    
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback re-classified successfully',
      feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CSV Ingestion parser
const parseCSV = (text) => {
  const result = [];
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const contentIdx = headers.findIndex(h => h.toLowerCase() === 'content');
  const channelIdx = headers.findIndex(h => h.toLowerCase() === 'channel');
  const labelIdx = headers.findIndex(h => h.toLowerCase() === 'customer_label');
  const dateIdx = headers.findIndex(h => h.toLowerCase() === 'created_at');

  if (contentIdx === -1) {
    throw new Error('CSV must contain a "content" column header');
  }

  // Parse rows (simple quotes parser)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // RegEx to split comma-separated values respecting enclosed double quotes
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ''));

    if (values[contentIdx]) {
      result.push({
        content: values[contentIdx],
        channel: channelIdx !== -1 && values[channelIdx] ? values[channelIdx] : 'Support ticket',
        customerLabel: labelIdx !== -1 && values[labelIdx] ? values[labelIdx] : 'General',
        createdAt: dateIdx !== -1 && values[dateIdx] ? new Date(values[dateIdx]) : new Date()
      });
    }
  }
  return result;
};

// CSV Bulk upload
export const bulkCSVUpload = async (req, res) => {
  try {
    const { csvText } = req.body;
    if (!csvText) {
      return res.status(400).json({ success: false, message: 'CSV raw text data is required' });
    }

    const workspaceId = req.user.workspaceId;
    const userId = req.user._id;

    let parsedRows = [];
    try {
      parsedRows = parseCSV(csvText);
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }

    if (parsedRows.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid rows found in CSV' });
    }

    const existingThemes = await AITheme.find({ workspaceId });
    let successCount = 0;
    let failCount = 0;

    console.log(`Starting bulk import of ${parsedRows.length} feedback logs...`);
    
    // Process rows sequentially/concurrently in batches
    for (const row of parsedRows) {
      try {
        // Run classification
        const classification = await classifyFeedback(row.content, existingThemes);
        const mappedThemes = [];
        
        for (const themeInfo of classification.themes) {
          let dbTheme = await AITheme.findOne({ name: themeInfo.name, workspaceId });
          if (!dbTheme) {
            dbTheme = await AITheme.create({
              name: themeInfo.name,
              description: themeInfo.description || 'Auto-created AI theme',
              color: themeInfo.color || '#3b82f6',
              workspaceId
            });
            // Update list of existing themes to prevent duplicate creations
            existingThemes.push(dbTheme);
          }
          mappedThemes.push({
            themeId: dbTheme._id,
            confidence: themeInfo.confidence || 1.0
          });
        }

        const embedding = await getEmbedding(row.content);

        await Feedback.create({
          title: `Imported Feedback #${successCount + 1}`,
          description: row.content,
          channel: row.channel,
          sourceRef: `CSV-${Math.floor(10000 + Math.random() * 90000)}`,
          customerLabel: row.customerLabel,
          sentiment: classification.sentiment,
          sentimentScore: classification.sentimentScore,
          status: 'NEW',
          category: classification.themes[0]?.name || 'General',
          themes: mappedThemes,
          featureArea: classification.featureArea,
          aiSummary: classification.summary,
          embedding,
          userId,
          workspaceId,
          createdAt: row.createdAt || new Date()
        });

        successCount++;
      } catch (err) {
        console.error('Failed to import CSV row:', err);
        failCount++;
      }
    }

    res.json({
      success: true,
      message: `Bulk CSV upload completed. Imported: ${successCount}, Failed: ${failCount}`,
      summary: {
        totalProcessed: parsedRows.length,
        success: successCount,
        failed: failCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Simulated logs channel ingestion
export const simulateIngestion = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const userId = req.user._id;

    // 10 realistic feedback items from simulated channels
    const simulatedLogs = [
      { content: "Your billing system charged us twice this month. Please issue a refund.", channel: "Support ticket", label: "SMB" },
      { content: "The new brand customizer settings update dynamically! Absolutely love it.", channel: "App store review", label: "Self-Serve" },
      { content: "Is there an easy way to export dashboard data tables to Excel spreadsheets?", channel: "Community post", label: "Enterprise" },
      { content: "Prospect wants custom branding and login screen customizations before committing to annual contract.", channel: "Sales call note", label: "Enterprise" },
      { content: "Opening the inbox page takes more than 10 seconds to respond. Latency is unacceptable.", channel: "Support ticket", label: "Enterprise" },
      { content: "The chatbot instructions say it is grounded, but it cannot answer where the settings menu is located.", channel: "NPS survey", label: "Self-Serve" },
      { content: "SSO login flows throw auth errors when users belong to subdomains.", channel: "Support ticket", label: "Enterprise" },
      { content: "Vibrant cyberpunk neon styling matches our developer brand perfectly.", channel: "App store review", label: "SMB" },
      { content: "We need slack integration webhooks to monitor onboarding dropoffs.", channel: "Community post", label: "SMB" },
      { content: "Pricing tier differences are ambiguous. We are unsure which seat plan fits our size.", channel: "Sales call note", label: "SMB" }
    ];

    const existingThemes = await AITheme.find({ workspaceId });
    let ingestedCount = 0;

    console.log(`Ingesting simulated channel feed into workspace...`);
    for (const log of simulatedLogs) {
      const classification = await classifyFeedback(log.content, existingThemes);
      const mappedThemes = [];

      for (const themeInfo of classification.themes) {
        let dbTheme = await AITheme.findOne({ name: themeInfo.name, workspaceId });
        if (!dbTheme) {
          dbTheme = await AITheme.create({
            name: themeInfo.name,
            description: themeInfo.description || 'Auto-created AI theme',
            color: themeInfo.color || '#3b82f6',
            workspaceId
          });
          existingThemes.push(dbTheme);
        }
        mappedThemes.push({
          themeId: dbTheme._id,
          confidence: themeInfo.confidence || 1.0
        });
      }

      const embedding = await getEmbedding(log.content);

      await Feedback.create({
        title: `Simulated Ingest Log - ${log.channel}`,
        description: log.content,
        channel: log.channel,
        sourceRef: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
        customerLabel: log.label,
        sentiment: classification.sentiment,
        sentimentScore: classification.sentimentScore,
        status: 'NEW',
        category: classification.themes[0]?.name || 'General',
        themes: mappedThemes,
        featureArea: classification.featureArea,
        aiSummary: classification.summary,
        embedding,
        userId,
        workspaceId
      });

      ingestedCount++;
    }

    res.json({
      success: true,
      message: `Ingested ${ingestedCount} mock feedback items from simulated channels successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
