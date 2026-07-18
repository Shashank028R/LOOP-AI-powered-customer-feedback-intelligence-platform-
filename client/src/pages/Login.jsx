import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import GlassPanel from '../components/GlassPanel';
import { Command, ShieldAlert, KeyRound, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoginLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password');
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 cyber-grid relative px-4">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pulse-glow-cyan pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px] pulse-glow-purple pointer-events-none" />

      <div className="max-w-md w-full relative z-10 animate-fade-in-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-amber-500 p-2.5 rounded-2xl shadow-neon-purple mb-3">
            <Command className="w-6 h-6 text-gray-950 stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-amber-400 text-glow-purple">
            PROJECT LOOP
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase font-mono tracking-widest">
            AI Customer-Feedback Platform
          </p>
        </div>

        <GlassPanel glowColor="purple" className="p-8 border-white/5">
          <h2 className="text-xl font-bold text-slate-100 mb-6 text-center">
            Access Workspace Panel
          </h2>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold px-4 py-3 rounded-xl mb-5 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. name@company.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Security Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/25 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-gray-950 font-bold py-3 rounded-xl shadow-neon-purple transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loginLoading ? 'Authenticating...' : 'Secure Login'}</span>
              {!loginLoading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-slate-400 font-medium">
            Don't have an isolated workspace yet?{' '}
            <Link to="/signup" className="text-amber-400 hover:underline">
              Register now
            </Link>
          </div>
        </GlassPanel>

        {/* Demo Accounts Quick-Fill Panel */}
        <div className="mt-6 bg-white/2.5 border border-white/5 rounded-2xl p-4 flex flex-col space-y-2">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block text-center">Demo Credentials (Seeded)</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { setEmail('shashank@projectloop.io'); setPassword('password123'); }}
              className="px-2 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-mono transition-all"
            >
              ADMIN
            </button>
            <button
              onClick={() => { setEmail('sujal@projectloop.io'); setPassword('password123'); }}
              className="px-2 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-mono transition-all"
            >
              ANALYST
            </button>
            <button
              onClick={() => { setEmail('viewer@projectloop.io'); setPassword('password123'); }}
              className="px-2 py-1.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg text-[10px] text-slate-300 font-mono transition-all"
            >
              VIEWER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
