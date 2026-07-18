import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../AuthContext';
import GlassPanel from '../components/GlassPanel';
import { 
  MessageSquare, 
  Layers, 
  Users, 
  BrainCircuit, 
  Plus, 
  Eye, 
  RefreshCw, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Cell, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const Dashboard = () => {
  const { token, user } = useAuth();
  
  // Dashboard states
  const [feedbacks, setFeedbacks] = useState([]);
  const [themesList, setThemesList] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats counts states
  const [statsData, setStatsData] = useState({
    totalFeedbacks: 0,
    totalUsers: 0,
    totalThemes: 0,
    aiSuccessRate: '98.8%',
    sentimentBreakdown: { pos: 0, neu: 0, neg: 0, posPercent: 0, neuPercent: 0, negPercent: 0 }
  });

  // Filters
  const [timeRange, setTimeRange] = useState('7'); // 7 days, 30 days, or 365 days
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newChannel, setNewChannel] = useState('Support ticket');
  const [newLabel, setNewLabel] = useState('General');
  const [savingFeedback, setSavingFeedback] = useState(false);

  const loadDashboardData = () => {
    setLoading(true);
    
    // Calculate dates
    const end = new Date();
    const start = new Date(end.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = end.toISOString().split('T')[0];

    // 1. Fetch feedbacks
    fetch(`${API_URL}/feedbacks?limit=10&startDate=${startDateStr}&endDate=${endDateStr}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFeedbacks(data.feedbacks);
        }
      })
      .catch(err => console.error('Error fetching dashboard feedbacks:', err));

    // 2. Fetch workspace stats
    fetch(`${API_URL}/workspace/stats?startDate=${startDateStr}&endDate=${endDateStr}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatsData(data.stats);
        }
      })
      .catch(err => console.error('Error fetching dashboard stats:', err));

    // 3. Fetch themes with counts
    fetch(`${API_URL}/ai-themes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setThemesList(data.themes);
        }
      })
      .catch(err => console.error('Error fetching dashboard themes:', err));

    // 4. Fetch daily trends matrix
    fetch(`${API_URL}/ai-themes/trends`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrendsData(data.dailyData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching trends line data:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [timeRange, token]);

  const handleCreateFeedback = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;
    setSavingFeedback(true);

    fetch(`${API_URL}/feedbacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        channel: newChannel,
        customerLabel: newLabel
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Feedback created and classified successfully!');
          setNewTitle('');
          setNewDescription('');
          setNewChannel('Support ticket');
          setNewLabel('General');
          setShowModal(false);
          loadDashboardData();
        } else {
          alert('Error: ' + data.message);
        }
        setSavingFeedback(false);
      })
      .catch(err => {
        console.error('Error creating feedback:', err);
        alert('Failed to save feedback.');
        setSavingFeedback(false);
      });
  };

  const statCards = [
    { name: 'Total Feedback Logs', value: loading ? '...' : statsData.totalFeedbacks.toString(), type: 'purple', icon: <MessageSquare className="w-5 h-5 text-amber-400" /> },
    { name: 'AI Theme Classes', value: loading ? '...' : statsData.totalThemes.toString(), type: 'cyan', icon: <Layers className="w-5 h-5 text-amber-300" /> },
    { name: 'Active Users', value: loading ? '...' : statsData.totalUsers.toString(), type: 'pink', icon: <Users className="w-5 h-5 text-slate-300" /> },
    { name: 'Claude Success Rate', value: loading ? '...' : statsData.aiSuccessRate, type: 'cyan', icon: <BrainCircuit className="w-5 h-5 text-amber-300 animate-pulse" /> },
  ];

  // Pie chart sentiment data formatting
  const pieData = [
    { name: 'Positive', value: statsData.sentimentBreakdown?.pos || 0, color: '#10b981' }, // Emerald
    { name: 'Neutral', value: statsData.sentimentBreakdown?.neu || 0, color: '#6b7280' },   // Slate
    { name: 'Negative', value: statsData.sentimentBreakdown?.neg || 0, color: '#f43f5e' }   // Rose
  ].filter(d => d.value > 0);

  // Bar chart top themes formatting
  const barData = themesList
    .slice(0, 5)
    .map(theme => ({
      name: theme.name.slice(0, 15) + (theme.name.length > 15 ? '..' : ''),
      count: theme.count,
      fill: theme.color
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      
      {/* Title / Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-glow-purple text-amber-400">
            Workspace Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time feed analytics and semantic customer insights for LOOP.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Time range selector */}
          <div className="flex items-center space-x-2 bg-white/5 border border-white/5 p-1 rounded-xl">
            {[
              { label: '7 Days', val: '7' },
              { label: '30 Days', val: '30' },
              { label: 'All Time', val: '365' }
            ].map(item => (
              <button
                key={item.val}
                onClick={() => setTimeRange(item.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  timeRange === item.val
                    ? 'bg-amber-500 text-gray-950 shadow-neon-purple font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* New Feedback modal trigger (ADMIN/ANALYST only) */}
          {user?.role !== 'VIEWER' && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl shadow-neon-purple transition-all duration-300 text-sm hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <GlassPanel key={i} glowColor={stat.type} className="relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{stat.name}</span>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-105 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">{stat.value}</span>
            </div>
            <div className={`absolute bottom-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-10 pointer-events-none ${
              stat.type === 'purple' ? 'bg-purple-500' : stat.type === 'cyan' ? 'bg-cyan-500' : 'bg-pink-500'
            }`} />
          </GlassPanel>
        ))}
      </div>

      {/* Recharts Volume timeline and breakdown charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Area Volume timeline (col-span-2) */}
        <GlassPanel glowColor="purple" className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Activity className="w-4.5 h-4.5 text-amber-400" />
              <span>Ingested Volume Trends</span>
            </h3>

            <div className="h-64 w-full">
              {trendsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="volumeGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090e1a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={trendsData.length > 0 && Object.keys(trendsData[0]).filter(k => k !== 'label' && k !== 'date')[0] || 'Feedback count'} 
                      stroke="#d4af37" 
                      fillOpacity={1} 
                      fill="url(#volumeGlow)" 
                      strokeWidth={2.5} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                  No trends timeline data.
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center text-xs text-slate-400">
            <span>Aggregated volumes matching active filter window.</span>
            <span className="flex items-center text-amber-400 font-semibold cursor-pointer hover:underline" onClick={() => window.location.hash = '#/trends'}>
              <span>Analyze theme timelines</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </GlassPanel>

        {/* Sentiment Donut chart */}
        <GlassPanel glowColor="cyan" className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <PieIcon className="w-4.5 h-4.5 text-amber-300" />
              <span>Sentiment Breakdown</span>
            </h3>

            <div className="h-64 w-full flex items-center justify-center">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090e1a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-slate-500 font-mono text-xs">No sentiment distribution data.</div>
              )}
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Bottom section: Bar chart and recent feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recharts Bar chart for themes */}
        <GlassPanel glowColor="pink" className="p-6">
          <h3 className="text-base font-bold text-slate-100 mb-4">Top AI Theme Weights</h3>
          <div className="h-64 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090e1a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No themes weights computed.
              </div>
            )}
          </div>
        </GlassPanel>

        {/* Recent activity list */}
        <GlassPanel glowColor="cyan" className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-4">Recent Feedback Logs</h3>
            <div className="space-y-4">
              {feedbacks.slice(0, 3).map((fb, idx) => (
                <div key={fb.id || idx} className="p-3.5 rounded-xl bg-white/2.5 border border-white/2.5 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200 line-clamp-1">{fb.title}</span>
                    <span className={`shrink-0 text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider border ${
                      fb.status === 'NEW'
                        ? 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                        : fb.status === 'REVIEWED'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {fb.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-1 leading-normal">{fb.description}</p>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mt-3 font-mono border-t border-white/2.5 pt-2">
                    <span>By {fb.author || 'System'} | Channel: {fb.channel}</span>
                    <span>{fb.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={() => window.location.hash = '#/inbox'}
            className="w-full mt-4 text-center text-xs font-bold text-amber-400 border border-amber-500/10 py-2 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 transition-all cursor-pointer"
          >
            Open Inbox Feed
          </button>
        </GlassPanel>

      </div>

      {/* New Feedback creation modal form (restrited to ADMIN or ANALYST in UI) */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
          <GlassPanel glowColor="purple" className="max-w-lg w-full mx-4 relative border border-white/10 shadow-2xl animate-fade-in-up">
            <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Create Workspace Feedback Log</span>
            </h2>
            <form onSubmit={handleCreateFeedback} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Feedback Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken invitation links in setting panel"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Source Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 focus:border-amber-500/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="Support ticket">Support ticket</option>
                    <option value="App store review">App store review</option>
                    <option value="NPS survey">NPS survey</option>
                    <option value="Sales call note">Sales call note</option>
                    <option value="Community post">Community post</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold uppercase">Customer Segment Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Enterprise, SMB, Self-Serve"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Feedback Description / Text logs</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Paste support email log, review, or ticket transcript here..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl text-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFeedback}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-gray-950 font-bold text-xs rounded-xl shadow-neon-purple transition-all flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{savingFeedback ? 'Running AI Agent...' : 'Submit Feedback'}</span>
                </button>
              </div>
            </form>
          </GlassPanel>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
