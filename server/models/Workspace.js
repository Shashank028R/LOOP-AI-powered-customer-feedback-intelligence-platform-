import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  }
}, {
  timestamps: true
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
