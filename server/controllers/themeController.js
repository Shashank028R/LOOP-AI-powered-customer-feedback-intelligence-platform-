import Theme from '../models/Theme.js';

/**
 * Get active theme for workspace
 */
export const getTheme = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    let theme = await Theme.findOne({ workspaceId });
    if (!theme) {
      theme = await Theme.create({
        name: 'Royal Gold & Navy',
        primaryColor: '#d4af37',
        secondaryColor: '#ffffff',
        backgroundColor: '#050a18',
        workspaceId
      });
    }

    res.json({
      success: true,
      theme: {
        name: theme.name,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        backgroundColor: theme.backgroundColor
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Save active theme for workspace (restricted to ADMIN)
 */
export const saveTheme = async (req, res) => {
  try {
    const { name, primaryColor, secondaryColor, backgroundColor } = req.body;
    const workspaceId = req.user.workspaceId;

    let theme = await Theme.findOne({ workspaceId });
    if (theme) {
      theme.name = name || theme.name;
      theme.primaryColor = primaryColor || theme.primaryColor;
      theme.secondaryColor = secondaryColor || theme.secondaryColor;
      theme.backgroundColor = backgroundColor || theme.backgroundColor;
      await theme.save();
    } else {
      theme = await Theme.create({
        name: name || 'Custom Theme',
        primaryColor: primaryColor || '#d4af37',
        secondaryColor: secondaryColor || '#ffffff',
        backgroundColor: backgroundColor || '#050a18',
        workspaceId
      });
    }

    res.json({
      success: true,
      message: 'Theme saved successfully',
      theme: {
        name: theme.name,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        backgroundColor: theme.backgroundColor
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
