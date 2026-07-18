import Report from '../models/Report.js';
import Feedback from '../models/Feedback.js';
import AITheme from '../models/AITheme.js';
import { generateVoCReportNarrative } from '../services/aiService.js';

/**
 * List all saved VoC reports
 */
export const getReports = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const reports = await Report.find({ workspaceId })
      .populate('generatedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get report details by ID
 */
export const getReportById = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const report = await Report.findOne({ _id: req.params.id, workspaceId })
      .populate('generatedBy', 'name role');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Generate Voice-of-Customer Report for a selected period range
 */
export const generateReport = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { startDate, endDate, title } = req.body;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const reportTitle = title || `Voice of Customer Report: ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`;

    // 1. Gather feedbacks in period
    const feedbacks = await Feedback.find({
      workspaceId,
      createdAt: { $gte: start, $lte: end }
    }).populate('themes.themeId', 'name color');

    const totalCount = feedbacks.length;
    if (totalCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No feedback items found within the selected date range. Cannot generate report.'
      });
    }

    // 2. Pre-compute sentiment splits
    let pos = 0, neu = 0, neg = 0;
    feedbacks.forEach(f => {
      if (f.sentiment === 'POS') pos++;
      else if (f.sentiment === 'NEG') neg++;
      else neu++;
    });

    const posPercent = Math.round((pos / totalCount) * 100);
    const neuPercent = Math.round((neu / totalCount) * 100);
    const negPercent = Math.round((neg / totalCount) * 100);

    // 3. Pre-compute categories volume
    const categoriesMap = {};
    feedbacks.forEach(f => {
      const cat = f.category || 'General';
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    // 4. Sentiment Shift vs Previous Week
    const periodDuration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodDuration);
    const prevEnd = new Date(start.getTime());

    const prevFeedbacks = await Feedback.find({
      workspaceId,
      createdAt: { $gte: prevStart, $lt: prevEnd }
    });

    let prevPos = 0;
    prevFeedbacks.forEach(f => {
      if (f.sentiment === 'POS') prevPos++;
    });
    const prevPosPercent = prevFeedbacks.length > 0 ? Math.round((prevPos / prevFeedbacks.length) * 100) : 50;
    const sentimentShiftVal = posPercent - prevPosPercent;
    const sentimentShift = sentimentShiftVal >= 0 
      ? `+${sentimentShiftVal}% improvement in positive sentiment`
      : `${sentimentShiftVal}% decline in positive sentiment`;

    // 5. Spiking Themes detection
    const themes = await AITheme.find({ workspaceId });
    const spikingThemes = [];
    for (const theme of themes) {
      const currThemeCount = await Feedback.countDocuments({
        workspaceId,
        'themes.themeId': theme._id,
        createdAt: { $gte: start, $lte: end }
      });
      const prevThemeCount = await Feedback.countDocuments({
        workspaceId,
        'themes.themeId': theme._id,
        createdAt: { $gte: prevStart, $lt: prevEnd }
      });

      const growth = prevThemeCount > 0 
        ? Math.round(((currThemeCount - prevThemeCount) / prevThemeCount) * 100)
        : (currThemeCount > 0 ? currThemeCount * 100 : 0);

      if (growth > 10) {
        spikingThemes.push({ name: theme.name, growth });
      }
    }

    // 6. Grab verbatim quotes sample (up to 8, with high/low scores)
    const sortedQuotes = [...feedbacks].sort((a, b) => Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore));
    const quotesSample = sortedQuotes.slice(0, 8);

    // Prepare stats payload
    const compiledStats = {
      totalCount,
      posPercent,
      neuPercent,
      negPercent,
      categories: categoriesMap,
      sentimentShift,
      spikingThemes
    };

    // 7. Request Claude narrative
    console.log(`Requesting Claude to compile narrative for report "${reportTitle}"`);
    const narrative = await generateVoCReportNarrative(reportTitle, compiledStats, quotesSample);

    // 8. Save report in DB
    const report = await Report.create({
      title: reportTitle,
      periodStart: start,
      periodEnd: end,
      contentJson: compiledStats,
      narrative,
      generatedBy: req.user._id,
      workspaceId
    });

    res.status(201).json({
      success: true,
      message: 'Voice-of-Customer report generated successfully',
      report
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
