# Project LOOP ── AI-Powered Customer Feedback Intelligence Platform

Project LOOP is a premium, multi-tenant SaaS application built on the MERN stack. It leverages artificial intelligence to ingest, parse, classify, and analyze customer feedback logs, converting unstructured customer support tickets, chat logs, and emails into structured, actionable taxonomy nodes.

The application features a modern dark-mode, glassmorphic neon cyberpunk visual interface built on React, Vite, and Tailwind CSS.

---

## 🚀 Key Features

* **Multi-Tenant Architecture**: Complete data isolation enforced across schemas. Every record (except workspaces themselves) points to a `workspaceId` tenant.
* **Role-Based Access Control (RBAC)**: Enforced authorization flow allowing user roles (`ADMIN`, `ANALYST`, `VIEWER`) to have fine-grained database and router permissions.
* **Neon Cyberpunk Interface**: Sleek dark UI utilizing frosted glass panels (`bg-gray-950`), glowing borders, and keyframe animations.
* **AI Feedback Classification**: Integration stub prepared to process logs and classify sentiment, category, tags, and urgency utilizing Anthropic's Claude 3.5 Sonnet.
* **Workspace Theme Customizer**: Real-time aesthetic presets and color configurations synchronized across workspace instances.
* **Live SaaS Dashboard & Inbox**: Interactive graphs, status triages, and exportable data tables.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), React Router, Tailwind CSS, Lucide Icons
* **Backend**: Node.js, Express.js (ES Modules, CORS, Helmet, JSON web tokens, Bcrypt)
* **Database**: MongoDB & Mongoose ORM
* **AI Engine**: Anthropic Claude 3.5 Sonnet (API Integration)

---

## 📁 Repository Structure

```text
LOOP/
├── client/                     # React Frontend Scaffolding
│   ├── src/
│   │   ├── components/         # Reusable layouts (Navbar, GlassPanel)
│   │   ├── pages/              # App screens (Dashboard, Inbox, AskLOOP, Themes, Reports)
│   │   └── App.jsx             # React router configuration
│   ├── tailwind.config.js      # Neon cyberpunk theme color tokens
│   └── postcss.config.js       # PostCSS compile plugins
│
└── server/                     # Node.js + Express Backend Scaffolding
    ├── config/db.js            # MongoDB Mongoose configurations
    ├── controllers/            # Registration, login, and tenant management
    ├── middleware/             # Auth JWT validators & role checkers
    ├── models/                 # Database Schemas (User, Workspace, Feedback, Theme)
    ├── routes/                 # Express API endpoints
    ├── scripts/seed.js         # Demo workspace and user seeding script
    └── services/aiService.js   # Anthropic Claude classification setup
```

---

## ⚙️ Quick Start Guide

### 1. Prerequisites
Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running on default port `27017`)

---

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Configure the local environment:
   - Copy `.env.example` to `.env`.
   - Update `MONGO_URI`, `JWT_SECRET`, or `ANTHROPIC_API_KEY` (if active credentials are ready).
4. Run the database seed script to generate sample accounts and feedback items:
   ```bash
   npm run seed
   ```
   *Seeded Accounts for Demo Workspace:*
   - **Admin**: `shashank@projectloop.io` (Password: `password123`)
   - **Analyst**: `sujal@projectloop.io` (Password: `password123`)
5. Spin up the Express server:
   ```bash
   npm start
   ```
   *The server runs by default on `http://localhost:5000`.*

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```
   *The client dashboard opens on `http://localhost:5173` (or the next available port).*
