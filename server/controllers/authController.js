import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, workspaceId: user.workspaceId },
    process.env.JWT_SECRET || 'supersecretjwtkeyforprojectloopdevelopment',
    { expiresIn: '30d' }
  );
};

export const register = async (req, res) => {
  const { name, email, password, workspaceName, workspaceSlug } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const slug = workspaceSlug || workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const workspaceExists = await Workspace.findOne({ slug });
    if (workspaceExists) {
      return res.status(400).json({ success: false, message: 'Workspace slug already in use' });
    }

    const workspace = await Workspace.create({
      name: workspaceName || `${name}'s Workspace`,
      slug
    });

    const user = await User.create({
      name,
      email,
      password,
      role: 'ADMIN',
      workspaceId: workspace._id
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId
        },
        workspace: {
          id: workspace._id,
          name: workspace.name,
          slug: workspace.slug
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('workspaceId');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId?._id
      },
      workspace: user.workspaceId ? {
        id: user.workspaceId._id,
        name: user.workspaceId.name,
        slug: user.workspaceId.slug
      } : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('workspaceId');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId?._id
      },
      workspace: user.workspaceId ? {
        id: user.workspaceId._id,
        name: user.workspaceId.name,
        slug: user.workspaceId.slug
      } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
