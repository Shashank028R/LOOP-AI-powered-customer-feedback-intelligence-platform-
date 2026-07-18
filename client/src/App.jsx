import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Themes from './pages/Themes';
import AskLoop from './pages/AskLoop';
import Reports from './pages/Reports';
import Trends from './pages/Trends';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Loader component matching the Neon Cyberpunk aesthetic
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 cyber-grid relative">
    <div className="absolute w-[300px] h-[300px] rounded-full blur-[100px] pulse-glow-purple pointer-events-none" />
    <div className="bg-gray-900/40 backdrop-blur-md border border-white/5 p-8 rounded-2xl flex flex-col items-center max-w-xs shadow-2xl">
      <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shadow-neon-purple mb-4" />
      <span className="text-sm font-bold text-amber-400 font-mono tracking-widest uppercase">Initializing LOOP...</span>
    </div>
  </div>
);

// Protected routes wrapper
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 cyber-grid relative">
      {/* Ambient Neon Glow Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] pulse-glow-purple -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] pulse-glow-cyan -z-10 pointer-events-none" />
      
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10 animate-fade-in-up">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes Layout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/themes" element={<Themes />} />
            <Route path="/ask-loop" element={<AskLoop />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/trends" element={<Trends />} />
          </Route>

          {/* ADMIN Only Protected Route */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Redirect fallbacks */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
