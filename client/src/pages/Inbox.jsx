import React, { useState } from 'react';
import GlassPanel from '../components/GlassPanel';
import { Search, Filter, MessageSquare, AlertCircle, Calendar, RefreshCcw, Tag } from 'lucide-react';

const Inbox = () => {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock feedback data matching the database seed setup
  const seedFeedbacks = [
    {
      id: '1',
      title: 'Add interactive dashboard graphs',
      description: 'We need graphs showing feedback counts by status and category over time.',
      status: 'PLANNED',
      category: 'Analytics',
      author: 'Shashank Kumar',
      role: 'ADMIN',
      date: '2026-07-13'
    },
    {
      id: '2',
      title: 'Anthropic Claude integration bug',
      description: 'Some raw customer support logs fail classification when formatting special characters.',
      status: 'NEW',
      category: 'AI Classification',
      author: 'SujalBhatt',
      role: 'ANALYST',
      date: '2026-07-13'
    },
    {
      id: '3',
      title: 'Cyberpunk glow theme configuration is fantastic',
      description: 'The glassmorphic components look amazing. No design adjustments needed!',
      status: 'COMPLETED',
      category: 'UI/UX',
      author: 'Shashank Kumar',
      role: 'ADMIN',
      date: '2026-07-12'
    },
    {
      id: '4',
      title: 'Export reports as CSV/PDF',
      description: 'Provide an export button in the reports tab to download analytical metrics.',
      status: 'UNDER_REVIEW',
      category: 'Reports',
      author: 'SujalBhatt',
      role: 'ANALYST',
      date: '2026-07-11'
    }
  ];

  const filteredFeedbacks = seedFeedbacks.filter(fb => {
    const matchesSearch = fb.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          fb.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || fb.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-glow-purple">
            Feedback Inbox
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Collect, triage, and organize customer feedback isolated within your workspace.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-4 py-2 rounded-xl transition-all">
          <RefreshCcw className="w-4 h-4 text-slate-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Controls Bar */}
      <GlassPanel glowColor="none" className="py-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/5 focus:border-purple-500/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/25 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['ALL', 'NEW', 'UNDER_REVIEW', 'PLANNED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-all border ${
                filter === status
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10 hover:text-slate-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Feedback Feed */}
      <div className="space-y-4">
        {filteredFeedbacks.length > 0 ? (
          filteredFeedbacks.map((fb) => (
            <GlassPanel key={fb.id} glowColor={fb.status === 'NEW' ? 'cyan' : 'purple'} className="p-5 hover:border-white/10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-base font-bold text-slate-100 hover:text-purple-300 cursor-pointer transition-colors">
                      {fb.title}
                    </h3>
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-slate-400 border border-white/5 font-semibold">
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>{fb.category}</span>
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{fb.description}</p>
                  
                  {/* Footer metadata */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 pt-2 font-mono">
                    <span className="flex items-center space-x-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                      <span>By <strong className="text-slate-400 font-semibold">{fb.author}</strong> ({fb.role})</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      <span>{fb.date}</span>
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-start md:self-center shrink-0">
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    fb.status === 'NEW'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : fb.status === 'UNDER_REVIEW'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        : fb.status === 'PLANNED'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      fb.status === 'NEW' ? 'bg-amber-400' : fb.status === 'UNDER_REVIEW' ? 'bg-cyan-400' : fb.status === 'PLANNED' ? 'bg-purple-400' : 'bg-emerald-400'
                    }`} />
                    <span>{fb.status.replace('_', ' ')}</span>
                  </span>
                </div>
              </div>
            </GlassPanel>
          ))
        ) : (
          <GlassPanel glowColor="none" className="text-center py-16">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No feedbacks found</h3>
            <p className="text-slate-500 text-sm mt-1">Try relaxing your search terms or filter constraints.</p>
          </GlassPanel>
        )}
      </div>
    </div>
  );
};

export default Inbox;
