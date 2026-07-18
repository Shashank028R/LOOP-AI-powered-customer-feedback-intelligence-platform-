import mongoose from 'mongoose';

const aiThemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    default: '#3b82f6', // Default blue
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  }
}, {
  timestamps: true
});

// Ensure theme names are unique within a single workspace
aiThemeSchema.index({ name: 1, workspaceId: 1 }, { unique: true });

const AITheme = mongoose.model('AITheme', aiThemeSchema);
export default AITheme;
