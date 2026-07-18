import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../AuthContext';
import { 
  Command, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings, 
  MessageSquare, 
  Paintbrush, 
  BrainCircuit, 
  BarChart3, 
  Layers, 
  Shield,
  LineChart
} from 'lucide-react';

const Navbar = () => {
  const { user, workspace, logout, token } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Load custom workspace aesthetic theme colors dynamically
  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/themes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.theme) {
            const root = document.documentElement;
            root.style.setProperty('--color-primary', data.theme.primaryColor);
            root.style.setProperty('--color-secondary', data.theme.secondaryColor);
            root.style.setProperty('--color-bg', data.theme.backgroundColor);
            root.style.setProperty('--color-accent', data.theme.primaryColor + 'cc');
          }
        })
        .catch(err => console.error('Error loading active theme:', err));
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Layers className="w-4 h-4" /> },
    { name: 'Inbox', path: '/inbox', icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'Trends', path: '/trends', icon: <LineChart className="w-4 h-4" /> },
    { name: 'Themes', path: '/themes', icon: <Paintbrush className="w-4 h-4" /> },
    { name: 'Ask LOOP', path: '/ask-loop', icon: <BrainCircuit className="w-4 h-4" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  // Include Settings tab only for ADMIN role
  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> });
  }

  // Get initials for profile avatar bubble
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-gray-950/75 backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Brand Logo and Active Workspace Display */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-amber-500 p-1.5 rounded-lg shadow-neon-purple">
              <Command className="w-5 h-5 text-gray-950 stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold tracking-wider text-amber-400 text-glow-purple">
              LOOP
            </span>
          </div>

          <div className="h-5 w-px bg-white/10" />

          {/* Active Workspace badge */}
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300 font-semibold">
            {workspace?.name || 'Isolated Workspace'}
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/5 text-amber-300 border-b border-amber-500/80 shadow-neon-purple'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Right Side: Profile Dropdown menu */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-gray-950 font-bold text-xs uppercase shadow-neon-purple font-mono">
              {getInitials(user?.name)}
            </div>
            
            <div className="hidden lg:block text-left text-xs pr-1">
              <div className="font-semibold text-slate-200 leading-normal">{user?.name || 'Loading user...'}</div>
              <div className="flex items-center space-x-1 text-slate-400">
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-gray-900/95 p-2 shadow-2xl backdrop-blur-lg">
              <div className="p-3 border-b border-white/5">
                <div className="font-semibold text-slate-200 text-sm">{user?.name}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</div>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono uppercase">
                  {user?.role} Role
                </div>
              </div>
              <div className="p-1 mt-1 space-y-0.5 text-xs font-semibold">
                {user?.role === 'ADMIN' && (
                  <button 
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-white/5 text-left transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Workspace Settings</span>
                  </button>
                )}
                <div className="h-px bg-white/5 my-1" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-left transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out Securely</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
