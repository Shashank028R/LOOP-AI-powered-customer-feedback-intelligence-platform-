import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../AuthContext';
import GlassPanel from '../components/GlassPanel';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw, 
  HelpCircle, 
  MessageSquare, 
  ChevronRight, 
  Calendar,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const Trends = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [spikes, setSpikes] = useState([]);
  
  // Drilldown state
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [drilldownFeedbacks, setDrilldownFeedbacks] = useState([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);

  const fetchTrends = () => {
    setLoading(true);
    // 1. Fetch AI themes with counts
    fetch(`${API_URL}/ai-themes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setThemes(data.themes);
          if (data.themes.length > 0 && !selectedTheme) {
            // Default select the first theme
            handleSelectTheme(data.themes[0]);
          }
        }
      })
      .catch(err => console.error('Error fetching themes:', err));

    // 2. Fetch trends line data and spikes
    fetch(`${API_URL}/ai-themes/trends`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrendsData(data.dailyData);
          setSpikes(data.spikes);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching trends:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrends();
  }, [token]);

  const handleSelectTheme = (theme) => {
    setSelectedTheme(theme);
    setDrilldownLoading(true);
    // Fetch feedbacks filtered by this theme from feed API
    fetch(`${API_URL}/feedbacks?theme=${theme.id}&limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDrilldownFeedbacks(data.feedbacks);
        }
        setDrilldownLoading(false);
      })
      .catch(err => {
        console.error('Error fetching drilldown:', err);
        setDrilldownLoading(false);
      });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-400 text-glow-purple">
            AI Theme Clustering & Trends
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track emerging customer pain points, monitor spiking issues, and drill down into verbatim comments.
          </p>
        </div>
        <button 
          onClick={fetchTrends}
          className="flex items-center space-x-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Spikes / Growth alerts bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {spikes.slice(0, 3).map((spike, idx) => (
          <GlassPanel 
            key={spike.id || idx} 
            glowColor={spike.isSpiking ? 'pink' : 'none'} 
            className="p-5 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                {spike.isSpiking ? '⚠️ High Growth Spike' : 'Theme Volume Change'}
              </span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                spike.growth >= 0 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {spike.growth >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                <span>{spike.growth >= 0 ? '+' : ''}{spike.growth}%</span>
              </span>
            </div>
            
            <h4 className="text-base font-bold text-slate-100 mt-2 truncate flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: spike.color }} />
              <span>{spike.name}</span>
            </h4>

            <div className="mt-4 flex items-baseline justify-between text-xs">
              <span className="text-slate-400">Current Week: <strong className="text-slate-200 font-mono">{spike.currentCount}</strong></span>
              <span className="text-slate-500">Previous Week: <span className="font-mono">{spike.prevCount}</span></span>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Recharts Area line graph */}
      <GlassPanel glowColor="purple" className="p-6">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center space-x-2">
          <Activity className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
          <span>Daily Theme Volume Distribution (Last 7 Days)</span>
        </h3>

        <div className="h-72 w-full pt-4">
          {trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {themes.map((theme, idx) => (
                    <linearGradient key={theme.id || idx} id={`grad-${theme.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.color} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={theme.color} stopOpacity={0.0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090e1a', borderColor: '#ffffff10', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fbbf24', fontFamily: 'monospace' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '15px' }} />
                {themes.map((theme) => (
                  <Area
                    key={theme.name}
                    type="monotone"
                    dataKey={theme.name}
                    stroke={theme.color}
                    fillOpacity={1}
                    fill={`url(#grad-${theme.id})`}
                    strokeWidth={2.5}
                    dot={{ r: 2, strokeWidth: 1 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
              No trends data loaded.
            </div>
          )}
        </div>
      </GlassPanel>

      {/* Main themes directory list and Drilldown section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left themes panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">AI Theme Taxonomy</div>
          {themes.map((theme) => (
            <div 
              key={theme.id}
              onClick={() => handleSelectTheme(theme)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedTheme?.id === theme.id
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-white/5 border-white/5 hover:bg-white/7.5 hover:border-white/10'
              }`}
            >
              <div className="space-y-1.5 flex-1 pr-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
                  <span className="font-bold text-sm text-slate-100">{theme.name}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1 leading-normal">{theme.description}</p>
                <div className="flex items-center space-x-2 text-[10px] font-mono">
                  <span className="text-slate-500">Avg Sentiment:</span>
                  <span className={`font-bold ${
                    theme.avgSentiment > 0.1 
                      ? 'text-emerald-400' 
                      : theme.avgSentiment < -0.1 
                        ? 'text-rose-400' 
                        : 'text-slate-400'
                  }`}>
                    {theme.avgSentiment > 0 ? '+' : ''}{theme.avgSentiment}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="bg-slate-900 border border-white/5 text-slate-300 font-mono text-[10px] font-bold px-2 py-1 rounded-lg">
                  {theme.count}
                </span>
                <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${selectedTheme?.id === theme.id ? 'translate-x-0.5' : ''}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Right drilldown feedbacks feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">
            Verbatims for: {selectedTheme ? selectedTheme.name : 'Select a theme'}
          </div>

          <GlassPanel glowColor="none" className="p-5 h-[480px] flex flex-col justify-between overflow-y-auto">
            {drilldownLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-3">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-slate-500 uppercase">Retrieving records...</span>
              </div>
            ) : drilldownFeedbacks.length > 0 ? (
              <div className="space-y-4 flex-1">
                {drilldownFeedbacks.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-xl bg-white/2.5 border border-white/2.5 hover:bg-white/5 transition-all space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-xs font-bold text-slate-100">{fb.title}</h4>
                      <span className={`shrink-0 flex items-center space-x-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        fb.sentiment === 'POS'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : fb.sentiment === 'NEG'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                            : 'bg-white/5 text-slate-300 border-white/10'
                      }`}>
                        {fb.sentiment === 'POS' ? <Smile className="w-2.5 h-2.5 text-emerald-400" /> : fb.sentiment === 'NEG' ? <Frown className="w-2.5 h-2.5 text-rose-400" /> : <Meh className="w-2.5 h-2.5 text-slate-400" />}
                        <span>{fb.sentiment} ({fb.sentimentScore})</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal">{fb.description}</p>
                    
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5 font-mono">
                      <span>Source: <strong className="text-slate-400">{fb.channel}</strong></span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{fb.date}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-slate-500 font-mono text-xs">
                <MessageSquare className="w-8 h-8 text-slate-700 mb-2" />
                <span>No verbatim items found in this theme yet.</span>
              </div>
            )}
          </GlassPanel>
        </div>

      </div>
    </div>
  );
};

export default Trends;
