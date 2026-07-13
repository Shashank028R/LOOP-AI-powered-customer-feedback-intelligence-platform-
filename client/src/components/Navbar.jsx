import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Command, ChevronDown, User, LogOut, Settings, MessageSquare, Paintbrush, BrainCircuit, BarChart3, Layers, Shield } from 'lucide-react';

const Navbar = () => {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  // Mock workspace state
  const [workspaces, setWorkspaces] = useState([
    { id: '1', name: 'Project LOOP Demo', slug: 'demo' },
    { id: '2', name: 'Acme Corp', slug: 'acme' },
  ]);
  const [currentWorkspace, setCurrentWorkspace] = useState(workspaces[0]);

  // Mock user state
  const currentUser = {
    name: 'Shashank Kumar',
    email: 'shashank@projectloop.io',
    role: 'ADMIN', // ADMIN, ANALYST, VIEWER
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Layers className="w-4 h-4" /> },
    { name: 'Inbox', path: '/inbox', icon: <MessageSquare className="w-4 h-4" /> },
    { name: 'Themes', path: '/themes', icon: <Paintbrush className="w-4 h-4" /> },
    { name: 'Ask LOOP', path: '/ask-loop', icon: <BrainCircuit className="w-4 h-4" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-gray-950/75 backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Side: Brand and Workspace Switcher */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-gradient-to-tr from-purple-500 to-cyan-400 p-1.5 rounded-lg shadow-neon-purple">
              <Command className="w-5 h-5 text-gray-950 stroke-[2.5]" />
            </div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent text-glow-purple">
              LOOP
            </span>
          </div>

          <div className="h-5 w-px bg-white/10" />

          {/* Workspace Switcher */}
          <div className="relative">
            <button
              onClick={() => { setWorkspaceOpen(!workspaceOpen); setProfileOpen(false); }}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-sm text-slate-200"
            >
              <span className="font-semibold">{currentWorkspace.name}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${workspaceOpen ? 'rotate-180' : ''}`} />
            </button>

            {workspaceOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-white/10 bg-gray-900/95 p-1.5 shadow-2xl backdrop-blur-lg">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Switch Workspace
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspace(ws);
                      setWorkspaceOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      currentWorkspace.id === ws.id
                        ? 'bg-purple-500/10 text-purple-300 font-medium'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{ws.name}</span>
                    {currentWorkspace.id === ws.id && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-neon-purple" />}
                  </button>
                ))}
              </div>
            )}
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
                    ? 'bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-300 border-b border-purple-500/40 shadow-[0_4px_12px_rgba(168,85,247,0.08)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Right Side: Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setWorkspaceOpen(false); }}
            className="flex items-center space-x-2.5 p-1 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 flex items-center justify-center text-gray-950 font-bold text-xs uppercase shadow-neon-cyan">
              {currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden lg:block text-left text-xs pr-1">
              <div className="font-semibold text-slate-200">{currentUser.name}</div>
              <div className="flex items-center space-x-1 text-slate-400">
                <Shield className="w-3 h-3 text-purple-400" />
                <span className="text-[10px] text-purple-300 font-semibold uppercase">{currentUser.role}</span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden lg:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-gray-900/95 p-2 shadow-2xl backdrop-blur-lg">
              <div className="p-3 border-b border-white/5">
                <div className="font-semibold text-slate-200 text-sm">{currentUser.name}</div>
                <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {currentUser.role} Role
                </div>
              </div>
              <div className="p-1 mt-1 space-y-0.5">
                <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 text-left transition-colors">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </button>
                <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 text-left transition-colors">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Workspace Settings</span>
                </button>
                <div className="h-px bg-white/5 my-1" />
                <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 text-left transition-colors">
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Log Out</span>
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
