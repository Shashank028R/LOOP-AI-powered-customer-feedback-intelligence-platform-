import AITheme from '../models/AITheme.js';
import Feedback from '../models/Feedback.js';

/**
 * Get all AI themes for workspace with feedback counts
 */
export const getAIThemes = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const themes = await AITheme.find({ workspaceId }).sort({ name: 1 });
    
    // Aggregation/map counts
    const themesWithCounts = await Promise.all(themes.map(async (theme) => {
      const count = await Feedback.countDocuments({
        workspaceId,
        'themes.themeId': theme._id
      });
      
      // Calculate avg sentiment for this theme
      const feedbacks = await Feedback.find({
        workspaceId,
        'themes.themeId': theme._id
      }).select('sentimentScore');

      let avgSentiment = 0;
      if (feedbacks.length > 0) {
        const sum = feedbacks.reduce((acc, f) => acc + (f.sentimentScore || 0), 0);
        avgSentiment = parseFloat((sum / feedbacks.length).toFixed(2));
      }

      return {
        id: theme._id.toString(),
        name: theme.name,
        description: theme.description,
        color: theme.color,
        count,
        avgSentiment
      };
    }));

    res.json({
      success: true,
      themes: themesWithCounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get AI Theme trends, daily distribution, and spike detection
 */
export const getAIThemeTrends = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    
    const themes = await AITheme.find({ workspaceId });
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Define period boundaries
    const currentStart = new Date(now.getTime() - 7 * oneDay);
    const previousStart = new Date(now.getTime() - 14 * oneDay);

    // Compute spikes: Compare counts in [now - 7d, now] vs [now - 14d, now - 7d]
    const spikes = await Promise.all(themes.map(async (theme) => {
      const currentCount = await Feedback.countDocuments({
        workspaceId,
        'themes.themeId': theme._id,
        createdAt: { $gte: currentStart }
      });

      const prevCount = await Feedback.countDocuments({
        workspaceId,
        'themes.themeId': theme._id,
        createdAt: { $gte: previousStart, $lt: currentStart }
      });

      // Growth percentage
      const difference = currentCount - prevCount;
      const pctGrowth = prevCount > 0 
        ? Math.round((difference / prevCount) * 100)
        : (currentCount > 0 ? currentCount * 100 : 0);

      return {
        id: theme._id.toString(),
        name: theme.name,
        color: theme.color,
        currentCount,
        prevCount,
        growth: pctGrowth,
        isSpiking: pctGrowth >= 20 // Spiking if growth is 20%+
      };
    }));

    // Generate daily time-series matrix for the last 7 days
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const dateTarget = new Date(now.getTime() - i * oneDay);
      const label = dateTarget.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const startOfDay = new Date(dateTarget.getFullYear(), dateTarget.getMonth(), dateTarget.getDate(), 0, 0, 0);
      const endOfDay = new Date(dateTarget.getFullYear(), dateTarget.getMonth(), dateTarget.getDate(), 23, 59, 59);

      const dayRecord = { label, date: startOfDay.toISOString().split('T')[0] };

      // Count for each theme
      for (const theme of themes) {
        const count = await Feedback.countDocuments({
          workspaceId,
          'themes.themeId': theme._id,
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
        dayRecord[theme.name] = count;
      }
      dailyData.push(dayRecord);
    }

    res.json({
      success: true,
      spikes: spikes.sort((a, b) => b.growth - a.growth),
      dailyData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
