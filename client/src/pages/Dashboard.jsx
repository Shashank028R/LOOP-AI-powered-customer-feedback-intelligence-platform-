import React from 'react';
import GlassPanel from '../components/GlassPanel';
import { MessageSquare, Layers, Users, BrainCircuit, ArrowUpRight, Plus, Eye, CheckCircle2, Clock } from 'lucide-react';

const Dashboard = () => {
  // Mock data
  const stats = [
    { name: 'Total Feedback', value: '1,482', change: '+12.5%', type: 'purple', icon: <MessageSquare className="w-5 h-5 text-purple-400" /> },
    { name: 'Active Themes', value: '3', change: 'Stable', type: 'cyan', icon: <Layers className="w-5 h-5 text-cyan-400" /> },
    { name: 'Workspace Users', value: '14', change: '+2 new', type: 'pink', icon: <Users className="w-5 h-5 text-pink-400" /> },
    { name: 'AI Success Rate', value: '98.6%', change: '+0.4%', type: 'cyan', icon: <BrainCircuit className="w-5 h-5 text-cyan-400" /> },
  ];

  const recentFeedback = [
    { id: 1, title: 'Add interactive dashboard graphs', category: 'Analytics', status: 'PLANNED', user: 'Shashank Kumar', time: '2 hours ago' },
    { id: 2, title: 'Anthropic Claude integration bug', category: 'AI Classification', status: 'NEW', user: 'SujalBhatt', time: '4 hours ago' },
    { id: 3, title: 'Cyberpunk glow theme is fantastic', category: 'UI/UX', status: 'COMPLETED', user: 'Shashank Kumar', time: '1 day ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Workspace Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time analytics and feedback classification for Project LOOP.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl shadow-neon-purple transition-all duration-300 text-sm hover:-translate-y-0.5">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Feedback</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <GlassPanel key={i} glowColor={stat.type} className="relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.name}</span>
              <div className={`p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-105 transition-transform`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{stat.value}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-slate-400'
              }`}>
                {stat.change}
              </span>
            </div>
            
            {/* Ambient background glow card indicators */}
            <div className={`absolute bottom-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-10 pointer-events-none ${
              stat.type === 'purple' ? 'bg-purple-500' : stat.type === 'cyan' ? 'bg-cyan-500' : 'bg-pink-500'
            }`} />
          </GlassPanel>
        ))}
      </div>

      {/* Main Panel Content: Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CSS Chart Panel */}
        <GlassPanel glowColor="purple" className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Feedback Volume & Classification</h3>
                <p className="text-slate-400 text-xs mt-0.5">Distribution over the past 7 days</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-purple-500">
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
            
            {/* Neon Bar Graph representation */}
            <div className="h-48 flex items-end justify-between gap-3 px-2 pt-6">
              {[
                { label: 'Mon', count: 32, value: '32%', glow: 'purple' },
                { label: 'Tue', count: 48, value: '48%', glow: 'cyan' },
                { label: 'Wed', count: 68, value: '68%', glow: 'purple' },
                { label: 'Thu', count: 52, value: '52%', glow: 'purple' },
                { label: 'Fri', count: 91, value: '91%', glow: 'cyan' },
                { label: 'Sat', count: 75, value: '75%', glow: 'purple' },
                { label: 'Sun', count: 85, value: '85%', glow: 'pink' }
              ].map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-200 bg-gray-900 border border-white/10 rounded px-2 py-1 text-[10px] text-slate-200 z-10 font-mono shadow-2xl">
                    {day.count} items
                  </div>
                  
                  {/* Bar */}
                  <div className="w-full bg-white/5 rounded-t-lg relative overflow-hidden h-40 flex items-end">
                    <div 
                      style={{ height: day.value }} 
                      className={`w-full rounded-t-lg transition-all duration-1000 ease-out ${
                        day.glow === 'purple' 
                          ? 'bg-gradient-to-t from-purple-600 to-purple-400 shadow-neon-purple' 
                          : day.glow === 'cyan' 
                            ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-neon-cyan'
                            : 'bg-gradient-to-t from-pink-600 to-pink-400 shadow-neon-pink'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 mt-2 font-mono">{day.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-6 pt-4 flex justify-between items-center text-xs text-slate-400">
            <span>Total analyzed items: 451</span>
            <span className="flex items-center text-purple-400 font-semibold cursor-pointer hover:underline">
              <span>View breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </GlassPanel>

        {/* Recent Feedback Feed */}
        <GlassPanel glowColor="cyan" className="flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-4">Seeded Feedbacks</h3>
            <div className="space-y-4">
              {recentFeedback.map((fb) => (
                <div key={fb.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">{fb.title}</span>
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider ${
                      fb.status === 'NEW' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : fb.status === 'PLANNED'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {fb.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 font-mono">
                    <span>By {fb.user}</span>
                    <span>{fb.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => window.location.hash = '#/inbox'}
            className="w-full mt-4 text-center text-xs font-semibold text-cyan-400 border border-cyan-500/10 py-2 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 transition-all"
          >
            Go to Inbox
          </button>
        </GlassPanel>

      </div>
    </div>
  );
};

export default Dashboard;
