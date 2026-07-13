import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import Theme from '../models/Theme.js';
import Feedback from '../models/Feedback.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/project-loop';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing database collections...');
    await Workspace.deleteMany({});
    await User.deleteMany({});
    await Theme.deleteMany({});
    await Feedback.deleteMany({});

    console.log('Creating demo workspace...');
    const workspace = await Workspace.create({
      name: 'Project LOOP Demo Workspace',
      slug: 'demo'
    });
    console.log(`Workspace created: "${workspace.name}" with ID: ${workspace._id}`);

    console.log('Seeding default Cyberpunk Theme...');
    const theme = await Theme.create({
      name: 'Neon Cyberpunk',
      primaryColor: '#c084fc', // Neon purple
      secondaryColor: '#22d3ee', // Neon cyan
      backgroundColor: '#030712', // bg-gray-955
      workspaceId: workspace._id
    });
    console.log(`Theme seeded: "${theme.name}"`);

    console.log('Seeding users...');
    
    // Admin user: Shashank Kumar
    const admin = await User.create({
      name: 'Shashank Kumar',
      email: 'shashank@projectloop.io',
      password: 'password123', // Will be hashed automatically by pre-save hooks
      role: 'ADMIN',
      workspaceId: workspace._id
    });
    console.log(`Admin created: ${admin.name} (${admin.email})`);

    // Analyst user: SujalBhatt
    const analyst = await User.create({
      name: 'SujalBhatt',
      email: 'sujal@projectloop.io',
      password: 'password123',
      role: 'ANALYST',
      workspaceId: workspace._id
    });
    console.log(`Analyst created: ${analyst.name} (${analyst.email})`);

    // Seed some test feedback
    console.log('Seeding sample feedback...');
    await Feedback.create([
      {
        title: 'Add interactive dashboard graphs',
        description: 'We need graphs showing feedback counts by status and category over time.',
        status: 'PLANNED',
        category: 'Analytics',
        userId: admin._id,
        workspaceId: workspace._id
      },
      {
        title: 'Anthropic Claude integration bug',
        description: 'Some raw customer support logs fail classification when formatting special characters.',
        status: 'NEW',
        category: 'AI Classification',
        userId: analyst._id,
        workspaceId: workspace._id
      },
      {
        title: 'Cyberpunk glow theme configuration is fantastic',
        description: 'The glassmorphic components look amazing. No design adjustments needed!',
        status: 'COMPLETED',
        category: 'UI/UX',
        userId: admin._id,
        workspaceId: workspace._id
      },
      {
        title: 'Export reports as CSV/PDF',
        description: 'Provide an export button in the reports tab to download analytical metrics.',
        status: 'UNDER_REVIEW',
        category: 'Reports',
        userId: analyst._id,
        workspaceId: workspace._id
      }
    ]);
    console.log('Feedback seeded successfully!');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
