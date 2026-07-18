import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import Theme from '../models/Theme.js';
import AITheme from '../models/AITheme.js';
import Feedback from '../models/Feedback.js';
import { getEmbedding } from '../lib/embeddings.js';

dotenv.config();

// Pre-defined detailed feedback templates to seed realistic data
const feedbackTemplates = [
  // Onboarding Experience
  {
    title: "Onboarding took forever",
    description: "Onboarding took forever — I couldn't figure out how to invite my team members to the dashboard.",
    channel: "Support ticket",
    sentiment: "NEG",
    sentimentScore: -0.7,
    category: "Onboarding",
    themeName: "Onboarding Experience",
    customerLabel: "Enterprise"
  },
  {
    title: "Simple and fast signup",
    description: "The signup flow was incredibly smooth. I created my workspace in less than 30 seconds!",
    channel: "App store review",
    sentiment: "POS",
    sentimentScore: 0.85,
    category: "Onboarding",
    themeName: "Onboarding Experience",
    customerLabel: "Self-Serve"
  },
  {
    title: "SSO invite link failure",
    description: "New teammates cannot join via SSO invitation link. They get redirected to an error 404 page.",
    channel: "Support ticket",
    sentiment: "NEG",
    sentimentScore: -0.8,
    category: "Onboarding",
    themeName: "Onboarding Experience",
    customerLabel: "Enterprise"
  },
  {
    title: "Great tutorial wizard",
    description: "The initial walkthrough tutorial was excellent! Guided me step-by-step on how to upload my first feedback logs.",
    channel: "NPS survey",
    sentiment: "POS",
    sentimentScore: 0.9,
    category: "Onboarding",
    themeName: "Onboarding Experience",
    customerLabel: "SMB"
  },
  {
    title: "Confusion around tenant workspace setup",
    description: "I was confused about how to configure my tenant workspace slug during the initial registration screen.",
    channel: "Community post",
    sentiment: "NEU",
    sentimentScore: -0.1,
    category: "Onboarding",
    themeName: "Onboarding Experience",
    customerLabel: "Self-Serve"
  },

  // Performance & Stability
  {
    title: "App running slow on dashboard page",
    description: "Hey LOOP team, your application is running extremely slow when opening the main dashboards page. Sometimes it throws 504 timeout errors.",
    channel: "Support ticket",
    sentiment: "NEG",
    sentimentScore: -0.9,
    category: "Performance",
    themeName: "Performance & Stability",
    customerLabel: "Enterprise"
  },
  {
    title: "Fast queries and quick responses",
    description: "The new search engine is extremely snappy! Searches across 10,000 items load in a split second.",
    channel: "App store review",
    sentiment: "POS",
    sentimentScore: 0.8,
    category: "Performance",
    themeName: "Performance & Stability",
    customerLabel: "Self-Serve"
  },
  {
    title: "CSV import crashes the tab",
    description: "When trying to import a CSV containing more than 2,000 rows, the browser tab freezes and throws an out of memory crash.",
    channel: "Support ticket",
    sentiment: "NEG",
    sentimentScore: -0.85,
    category: "Performance",
    themeName: "Performance & Stability",
    customerLabel: "SMB"
  },
  {
    title: "API response latency spikes",
    description: "We are noticing API response times spiking during peak hours between 2 PM and 4 PM EST.",
    channel: "Support ticket",
    sentiment: "NEG",
    sentimentScore: -0.5,
    category: "Performance",
    themeName: "Performance & Stability",
    customerLabel: "Enterprise"
  },
  {
    title: "Real-time sync feels instant",
    description: "Updating themes and updating feedback status updates immediately across all screens without reloading.",
    channel: "Community post",
    sentiment: "POS",
    sentimentScore: 0.75,
    category: "Performance",
    themeName: "Performance & Stability",
    customerLabel: "Self-Serve"
  },

  // Billing & Pricing
  {
    title: "SSO requirement on Enterprise pricing",
    description: "Prospect wants SSO before they will sign — third time this month. We need to explain why it is locked to the expensive Enterprise plan.",
    channel: "Sales call note",
    sentiment: "NEG",
    sentimentScore: -0.4,
    category: "Billing",
    themeName: "Billing & Pricing",
    customerLabel: "Enterprise"
  },
  {
    title: "Pricing is transparent and fair",
    description: "I love the flat pricing tier. It is much better than usage-based billing models that charge per API call.",
    channel: "NPS survey",
    sentiment: "POS",
    sentimentScore: 0.9,
    category: "Billing",
    themeName: "Billing & Pricing",
    customerLabel: "SMB"
  },
  {
    title: "Billing page keeps timing out",
    description: "Billing page keeps timing out when I try to download an invoice. Can you please send the PDF manually?",
    channel: "Support ticket",
    sentiment: "NEG",
    sentimentScore: -0.6,
    category: "Billing",
    themeName: "Billing & Pricing",
    customerLabel: "Enterprise"
  },
  {
    title: "Failed payment credit card alert",
    description: "Customer card declined twice, they want to pay via bank wire transfer but cannot find the routing details in their settings.",
    channel: "Sales call note",
    sentiment: "NEU",
    sentimentScore: -0.2,
    category: "Billing",
    themeName: "Billing & Pricing",
    customerLabel: "Enterprise"
  },
  {
    title: "Refund request for unused seats",
    description: "We removed 5 analysts last week but were still billed for them. Requesting a refund or seat credit.",
    channel: "Support ticket",
    sentiment: "NEG",
    sentimentScore: -0.5,
    category: "Billing",
    themeName: "Billing & Pricing",
    customerLabel: "SMB"
  },

  // UI/UX Polish
  {
    title: "Cyberpunk neon theme is gorgeous",
    description: "The glassmorphic components look amazing and the neon purple glow is beautiful. Finally an app that does not look like a generic white dashboard!",
    channel: "App store review",
    sentiment: "POS",
    sentimentScore: 0.95,
    category: "UI/UX",
    themeName: "UI/UX Polish",
    customerLabel: "Self-Serve"
  },
  {
    title: "Mobile inbox is completely broken",
    description: "The feedback list tables overflow horizontally on mobile Safari. The buttons shrink and become impossible to tap.",
    channel: "NPS survey",
    sentiment: "NEG",
    sentimentScore: -0.75,
    category: "UI/UX",
    themeName: "UI/UX Polish",
    customerLabel: "SMB"
  },
  {
    title: "Contrast issues in dark mode",
    description: "The gray text on the glassmorphic dark blue panels is very hard to read in bright sunlight. We need a higher contrast option.",
    channel: "Community post",
    sentiment: "NEU",
    sentimentScore: -0.3,
    category: "UI/UX",
    themeName: "UI/UX Polish",
    customerLabel: "Self-Serve"
  },
  {
    title: "Beautiful chart animations",
    description: "I love the smooth hover animations on the volume time-series charts. Feels extremely premium and responsive.",
    channel: "NPS survey",
    sentiment: "POS",
    sentimentScore: 0.85,
    category: "UI/UX",
    themeName: "UI/UX Polish",
    customerLabel: "Self-Serve"
  },
  {
    title: "Status change needs confirmation",
    description: "Toggling the feedback status from NEW to ACTIONED is too easy to do by accident. Please add a quick undo toast.",
    channel: "Community post",
    sentiment: "NEU",
    sentimentScore: -0.1,
    category: "UI/UX",
    themeName: "UI/UX Polish",
    customerLabel: "SMB"
  },

  // Feature Requests
  {
    title: "Export reports to PDF/CSV",
    description: "Love the new Voice-of-Customer reports. We really need an export to PDF or CSV button so we can share it with the product team directly.",
    channel: "Community post",
    sentiment: "POS",
    sentimentScore: 0.6,
    category: "Features",
    themeName: "Feature Requests",
    customerLabel: "Enterprise"
  },
  {
    title: "Intercom live chat integration",
    description: "Are there any plans to sync feedback directly from Intercom? Copy pasting support logs is starting to become tedious.",
    channel: "Sales call note",
    sentiment: "NEU",
    sentimentScore: 0.2,
    category: "Features",
    themeName: "Feature Requests",
    customerLabel: "Enterprise"
  },
  {
    title: "Slack notifications for negative feedback",
    description: "We want a Slack webhook integration that alerts our customer success channel whenever high urgency negative feedback is ingested.",
    channel: "Support ticket",
    sentiment: "NEU",
    sentimentScore: 0.1,
    category: "Features",
    themeName: "Feature Requests",
    customerLabel: "SMB"
  },
  {
    title: "Bulk update actions in inbox",
    description: "Allowing us to select multiple feedback items and change status, category, or delete them in one click would be a massive timesaver.",
    channel: "Community post",
    sentiment: "NEU",
    sentimentScore: 0.3,
    category: "Features",
    themeName: "Feature Requests",
    customerLabel: "Self-Serve"
  },
  {
    title: "AI generated ticket replies",
    description: "It would be amazing if Ask LOOP could draft a recommended email reply to the customer based on the feedback resolution.",
    channel: "Sales call note",
    sentiment: "POS",
    sentimentScore: 0.7,
    category: "Features",
    themeName: "Feature Requests",
    customerLabel: "Enterprise"
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project-loop';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Cleaning up collections...');
    await Workspace.deleteMany({});
    await User.deleteMany({});
    await Theme.deleteMany({});
    await AITheme.deleteMany({});
    await Feedback.deleteMany({});

    console.log('Creating demo workspace...');
    const workspace = await Workspace.create({
      name: 'Project LOOP Demo Workspace',
      slug: 'demo'
    });

    console.log('Seeding default aesthetic Theme...');
    await Theme.create({
      name: 'Royal Gold & Navy',
      primaryColor: '#d4af37',
      secondaryColor: '#ffffff',
      backgroundColor: '#050a18',
      workspaceId: workspace._id
    });

    console.log('Seeding user roles...');
    const adminUser = await User.create({
      name: 'Shashank Kumar',
      email: 'shashank@projectloop.io',
      password: 'password123',
      role: 'ADMIN',
      workspaceId: workspace._id
    });
    console.log(`Admin User: ${adminUser.email}`);

    const analystUser = await User.create({
      name: 'SujalBhatt',
      email: 'sujal@projectloop.io',
      password: 'password123',
      role: 'ANALYST',
      workspaceId: workspace._id
    });
    console.log(`Analyst User: ${analystUser.email}`);

    const viewerUser = await User.create({
      name: 'Viewer Demo',
      email: 'viewer@projectloop.io',
      password: 'password123',
      role: 'VIEWER',
      workspaceId: workspace._id
    });
    console.log(`Viewer User: ${viewerUser.email}`);

    console.log('Seeding AI classification themes...');
    const themesData = [
      { name: "Onboarding Experience", description: "Feedback regarding the user registration and onboarding flow", color: "#a855f7" },
      { name: "Performance & Stability", description: "Lags, API errors, timeouts, and system crashes", color: "#ef4444" },
      { name: "Billing & Pricing", description: "Inquiries or complaints about plans, pricing tiers, and invoices", color: "#3b82f6" },
      { name: "UI/UX Polish", description: "Design layout, responsiveness, animations, and color aesthetics", color: "#06b6d4" },
      { name: "Feature Requests", description: "Suggestions for new features and additions to the platform", color: "#10b981" }
    ];

    const themesMap = {};
    for (const t of themesData) {
      const createdTheme = await AITheme.create({
        ...t,
        workspaceId: workspace._id
      });
      themesMap[t.name] = createdTheme;
    }
    console.log('AI themes created successfully.');

    console.log('Generating 120+ realistic feedback items...');
    const feedbacksToInsert = [];
    const totalCountNeeded = 135;

    // Seed users who submitted feedback
    const users = [adminUser._id, analystUser._id];
    
    // Spread dates over the last 30 days for beautiful Recharts graphs
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 0; i < totalCountNeeded; i++) {
      const template = feedbackTemplates[i % feedbackTemplates.length];
      const randomUser = users[i % users.length];
      
      // Add variance to description to make items distinct
      let customDesc = template.description;
      if (i >= feedbackTemplates.length) {
        customDesc += ` (Follow-up log #${Math.floor(i / feedbackTemplates.length)} - workspace reference ${i})`;
      }

      // Spread timestamps sequentially over 30 days
      const daysAgo = (i % 30);
      const randomHours = Math.random() * 24;
      const createdDate = new Date(now - (daysAgo * oneDay) - (randomHours * 60 * 60 * 1000));

      const themeObj = themesMap[template.themeName];
      const statusValue = i % 3 === 0 ? 'ACTIONED' : (i % 3 === 1 ? 'REVIEWED' : 'NEW');

      feedbacksToInsert.push({
        title: `${template.title} #${i + 1}`,
        description: customDesc,
        channel: template.channel,
        sourceRef: `LOOP-${1000 + i}`,
        customerLabel: template.customerLabel,
        sentiment: template.sentiment,
        sentimentScore: parseFloat((template.sentimentScore + (Math.random() * 0.1 - 0.05)).toFixed(2)),
        status: statusValue,
        category: template.category,
        themes: [{
          themeId: themeObj._id,
          confidence: parseFloat((0.85 + Math.random() * 0.15).toFixed(2))
        }],
        featureArea: template.category + ' Section',
        aiSummary: `Customer raised an issue in ${template.category} regarding ${template.title.toLowerCase()}.`,
        userId: randomUser,
        workspaceId: workspace._id,
        createdAt: createdDate,
        updatedAt: createdDate
      });
    }

    console.log('Computing local embeddings for all feedback logs (this may take a few seconds)...');
    let embeddingsComputedCount = 0;
    
    for (const fb of feedbacksToInsert) {
      try {
        // Compute real embedding
        fb.embedding = await getEmbedding(fb.description);
        embeddingsComputedCount++;
      } catch (err) {
        // Embedding generator handles fallback internally, but let's make sure
        const fallback = Array.from({ length: 384 }, () => Math.random() * 2 - 1);
        const magnitude = Math.sqrt(fallback.reduce((sum, val) => sum + val * val, 0));
        fb.embedding = fallback.map(val => val / (magnitude || 1));
      }
      
      if (embeddingsComputedCount % 30 === 0) {
        console.log(`Generated embeddings for ${embeddingsComputedCount}/${feedbacksToInsert.length} items...`);
      }
    }

    console.log('Saving feedback records to MongoDB...');
    await Feedback.insertMany(feedbacksToInsert);
    console.log(`Successfully seeded ${feedbacksToInsert.length} feedback items (all containing vector embeddings).`);

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
