import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    enum: ['Support ticket', 'App store review', 'NPS survey', 'Sales call note', 'Community post'],
    default: 'Support ticket',
  },
  sourceRef: {
    type: String,
    trim: true,
  },
  customerLabel: {
    type: String,
    trim: true,
    default: 'General',
  },
  sentiment: {
    type: String,
    enum: ['POS', 'NEU', 'NEG'],
    default: 'NEU',
  },
  sentimentScore: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['NEW', 'REVIEWED', 'ACTIONED'],
    default: 'NEW',
  },
  category: {
    type: String,
    trim: true,
    default: 'General',
  },
  themes: [{
    themeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AITheme',
    },
    confidence: {
      type: Number,
      default: 1.0,
    }
  }],
  featureArea: {
    type: String,
    trim: true,
  },
  aiSummary: {
    type: String,
    trim: true,
  },
  embedding: {
    type: [Number],
    default: undefined,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
