# Project LOOP ── AI-Powered Customer Feedback Intelligence Platform

Project LOOP is a premium, multi-tenant SaaS application that leverages artificial intelligence to ingest, parse, classify, and analyze customer feedback logs. It converts unstructured customer support tickets, app reviews, survey responses, and sales logs into structured, actionable taxonomies and delivers retrieval-grounded insights.

The frontend is built as a glassmorphic neon cyberpunk panel using React, Vite, Tailwind CSS, and Recharts. The backend is powered by Node.js, Express, and MongoDB.

---

## 🚀 Key Features & How to Use Them

### 1. Secure Authentication & Workspace Isolation (C1)
- **What it does**: Restricts access so users only see and interact with data belonging to their workspace. Signing up automatically creates a new Administrator account and a dedicated `Workspace` tenant.
- **How to use / test**:
  1. Open the application. If not logged in, you will be redirected to the `/login` portal.
  2. Click **Register now** to create a new admin user and workspace.
  3. Log in with your credentials. Your session will persist across page refreshes using local JWT storage.
  4. Ensure all pages display only data associated with your workspace.

### 2. Role-Based Access Control (C2)
- **What it does**: Enforces permission guards across three user roles:
  - `ADMIN`: Full database control, settings modifications, member role overrides, style customization, and reports generation.
  - `ANALYST`: Manage feedbacks (single creation, CSV upload, mock channel pulls), triage status workflows, and generate reports.
  - `VIEWER`: Read-only views of the dashboard, inbox, trends, and Q&A. Denied write and edit actions.
- **How to use / test**:
  1. Log in as a `VIEWER` (e.g. `viewer@projectloop.io`).
  2. Attempt to create feedback or modify a status dropdown. Notice that the actions are restricted in the UI, and any direct API requests return a `403 Forbidden` error.
  3. Log in as an `ADMIN` (e.g. `shashank@projectloop.io`). Go to the **Settings** tab. You can view all members, invite new teammates by email, update their access roles, or revoke workspace access.

### 3. Feedback Ingestion (C3)
- **What it does**: Supports ingestion from multiple sources:
  1. **Single Entry**: A validate-guarded manual entry form for logging single support interactions.
  2. **CSV Bulk Upload**: Client-side parsing of CSV files (`content`, `channel`, `customer_label`, `created_at` headers) with background AI classification.
  3. **Simulated Channels**: Ingestion of a simulated feed of 10 customer logs on a single button click.
- **How to use / test**:
  1. Go to the **Inbox** page.
  2. Click **Simulate Channels** to ingest a batch of simulated logs.
  3. Click **Import CSV** and select a formatted `.csv` file. You will see an alert summarizing successfully parsed rows and failed rows.
  4. Use the **New Feedback** modal button on the Dashboard to submit a single entry.

### 4. Interactive Triage Inbox & Dashboard (C4, C5)
- **What it does**:
  - **Inbox**: Features server-side pagination, full-text searches, and filters by source channel, sentiment rating, AI theme node, status, and custom date ranges.
  - **Status Workflow**: Tracks statuses (`NEW` → `REVIEWED` → `ACTIONED`) which can be changed inline.
  - **Dashboard**: Features Recharts charts showing volume timeline logs (Area), sentiment breakdowns (Donut), and top theme distributions (Bar chart).
- **How to use / test**:
  1. Go to the **Inbox** page. Tweak the dates, sentiment filters, and channels. Click the status dropdown on a card to triage it.
  2. Go to the **Dashboard** page. Observe the Recharts rendering the aggregates of your feedback. Change the filter range (e.g. 7 Days to 30 Days) and verify that all dashboard statistics and Recharts update dynamically.

### 5. AI Suite (AI1 - AI4)
- **AI1: Structured Auto-Classification**: Ingested feedback is sent to Claude 3.5 Sonnet to determine positive/neutral/negative sentiment, sentiment score (-1..1), matching themes, feature area label, and a summary. Response schema is verified with Zod.
- **AI2: Theme Clustering**: Automatically groups feedbacks into themes. If a log does not fit any existing theme, a new theme node is dynamically created in the workspace. The **Trends** tab displays theme growth curves and spike alarms. Clicking a theme drills down to view its feedbacks.
- **AI3: Ask LOOP (Grounded Q&A)**: Generates 384-dimensional dense vectors locally using ONNX `all-MiniLM-L6-v2` transformers. Calculates cosine similarity to fetch top-K matches, then prompts Claude to answer questions strictly using retrieved context, including verified source citation links.
- **AI4: Voice-of-Customer Reports**: Aggregates period statistics (growth deltas, verbatim quotes) and prompts Claude for narrative briefs (Executive Summary, Detailed Insights, Recommended Actions).
- **How to use / test**:
  1. Go to the **Trends** tab. Click a theme (e.g., "Performance & Stability") and check that matching feedbacks load in the side drawer.
  2. Go to the **Ask LOOP** page. Type a question or click a preset suggestion. Wait for the answer to load, then click the source citation bubble links to inspect the verifying logs.
  3. Go to the **Reports** page. Click **Run Digest Engine** to generate a markdown VoC analysis. Tap **Export PDF Report** to print/save it using browser print style configurations.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router, Recharts, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express, Helmet, CORS, JSON Web Tokens, Bcrypt
- **Database**: MongoDB & Mongoose ORM
- **Embeddings Math**: ONNX Runtime (`all-MiniLM-L6-v2` local pipelines)
- **AI Engine**: Anthropic Claude 3.5 Sonnet (API Integration)

---

## 📁 Repository Structure

```text
LOOP/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable layouts (Navbar, GlassPanel)
│   │   ├── pages/              # Screens (Dashboard, Inbox, AskLoop, Themes, Reports, Trends, Settings, Login, Signup)
│   │   ├── AuthContext.jsx     # JWT states & profile contexts
│   │   ├── App.jsx             # Protected router mappings
│   │   └── index.css           # Custom cyberpunk styles & grid setups
│   └── tailwind.config.js      # Styling design configurations
│
└── server/                     # Node.js + Express Backend
    ├── config/db.js            # MongoDB connection configuration
    ├── controllers/            # Logic (Auth, Feedback, AIThemes, Insights, Reports, Workspace)
    ├── middleware/             # Auth JWT validators & role checkers
    ├── models/                 # Database Schemas (User, Workspace, Feedback, Theme, AITheme, Report)
    ├── routes/                 # API endpoints (Auth, Feedbacks, Themes, AIThemes, Insights, Reports, Workspaces)
    ├── scripts/
    │   ├── seed.js             # Seeding script populating 135 feedbacks and vector embeddings
    │   └── verify-api.js       # Dynamic API verification test suite
    └── services/aiService.js   # Anthropic Claude classification & RAG setups
```

---

## ⚙️ Quick Start Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Running instance)

### 2. Backend Installation & Seeding
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the local environment:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5050
   MONGO_URI=mongodb://localhost:27017/Loop
   JWT_SECRET=supersecretjwtkeyforprojectloopdevelopment
   ANTHROPIC_API_KEY=your-active-anthropic-api-key
   ```
4. Run the seed script to generate sample accounts and feedbacks with vector embeddings:
   ```bash
   npm run seed
   ```
5. Start the Express API server:
   ```bash
   npm start
   ```
   *The server runs on `http://localhost:5050`.*

### 3. Frontend Installation
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Boot the local development server:
   ```bash
   npm run dev
   ```
   *The client opens on `http://localhost:5173`.*

---

## 🧪 Running Integration Verification Tests
We have shipped an integration test suite that tests every core API route, security isolation rule, RBAC rule, vector RAG logic, and AI generation flow. To run it:
```bash
cd server
node scripts/verify-api.js
```
All tests must output `✅` and end with `=== ALL LOOP API TESTS PASSED SUCCESSFULLY! ===`.
