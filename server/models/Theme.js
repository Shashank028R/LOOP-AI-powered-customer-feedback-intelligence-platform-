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
    default: '#a855f7', // default purple-500
  },
  secondaryColor: {
    type: String,
    required: true,
    default: '#06b6d4', // default cyan-500
  },
  backgroundColor: {
    type: String,
    required: true,
    default: '#030712', // default gray-955
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    unique: true, // each workspace has exactly one custom active theme configurations or name details
  }
}, {
  timestamps: true
});

const Theme = mongoose.model('Theme', themeSchema);
export default Theme;
