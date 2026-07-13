import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Themes from './pages/Themes';
import AskLoop from './pages/AskLoop';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-950 cyber-grid relative">
        {/* Ambient Neon Glow Blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] pulse-glow-purple -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] pulse-glow-cyan -z-10 pointer-events-none" />
        
        {/* Sticky Navigation Header */}
        <Navbar />

        {/* Workspace Main Page Layout */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/ask-loop" element={<AskLoop />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
