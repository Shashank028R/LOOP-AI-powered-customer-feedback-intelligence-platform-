import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  primaryColor: {
    type: String,
    required: true,
    default: '#a855f7',
  },
  secondaryColor: {
    type: String,
    required: true,
    default: '#06b6d4',
  },
  backgroundColor: {
    type: String,
    required: true,
    default: '#030712', 
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    unique: true, 
  }
}, {
  timestamps: true
});

const Theme = mongoose.model('Theme', themeSchema);
export default Theme;
