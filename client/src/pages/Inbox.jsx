import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../AuthContext';
import GlassPanel from '../components/GlassPanel';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  AlertCircle, 
  Calendar, 
  RefreshCcw, 
  Tag, 
  Upload, 
  Flame, 
  BrainCircuit, 
  ArrowLeft, 
  ArrowRight,
  Smile,
  Meh,
  Frown,
  Activity,
  Cpu,
  CornerDownRight,
  X
} from 'lucide-react';

const Inbox = () => {
  const { token, user } = useAuth();
  
  // Data list states
  const [feedbacks, setFeedbacks] = useState([]);
  const [themesList, setThemesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [themeFilter, setThemeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Bulk / Ingestion states
  const [uploadMessage, setUploadMessage] = useState({ text: '', type: '' });
  const [simulateLoading, setSimulateLoading] = useState(false);

  // Sidebar / Details state
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reclassifying, setReclassifying] = useState(false);

  // Fetch AI themes for dropdown filter options
  const fetchThemes = () => {
    fetch(`${API_URL}/ai-themes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setThemesList(data.themes);
        }
      })
      .catch(err => console.error('Error loading themes list filter:', err));
  };

  // Fetch Feedbacks from Server (Paginated and Filtered)
  const fetchFeedbacks = () => {
    setLoading(true);
    
    // Construct query parameters
    const params = new URLSearchParams({
      page,
      limit: 10,
      search: searchTerm,
      status: statusFilter,
      channel: channelFilter,
      sentiment: sentimentFilter,
      theme: themeFilter,
      startDate,
      endDate
    });

    fetch(`${API_URL}/feedbacks?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFeedbacks(data.feedbacks);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.total);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading feedbacks list:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchThemes();
  }, [token]);

  useEffect(() => {
    fetchFeedbacks();
  }, [page, statusFilter, channelFilter, sentimentFilter, themeFilter, startDate, endDate, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFeedbacks();
  };

  // Change feedback status inline
  const handleStatusChange = (feedbackId, newStatus) => {
    fetch(`${API_URL}/feedbacks/${feedbackId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFeedbacks(feedbacks.map(f => f.id === feedbackId ? { ...f, status: newStatus } : f));
          if (selectedFeedback && selectedFeedback.id === feedbackId) {
            setSelectedFeedback({ ...selectedFeedback, status: newStatus });
          }
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(err => console.error('Error changing feedback status:', err));
  };

  // Run AI Re-classification
  const handleReclassify = (feedbackId) => {
    setReclassifying(true);
    fetch(`${API_URL}/feedbacks/${feedbackId}/reclassify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const updated = {
            id: data.feedback._id.toString(),
            title: data.feedback.title,
            description: data.feedback.description,
            channel: data.feedback.channel,
            sourceRef: data.feedback.sourceRef,
            customerLabel: data.feedback.customerLabel,
            sentiment: data.feedback.sentiment,
            sentimentScore: data.feedback.sentimentScore,
            status: data.feedback.status,
            category: data.feedback.category,
            themes: data.feedback.themes.map(t => {
              const matchedTheme = themesList.find(th => th.id === t.themeId);
              return {
                id: t.themeId,
                name: matchedTheme?.name || 'Theme Name',
                color: matchedTheme?.color || '#3b82f6',
                confidence: t.confidence
              };
            }),
            featureArea: data.feedback.featureArea,
            aiSummary: data.feedback.aiSummary,
            date: new Date(data.feedback.createdAt).toISOString().split('T')[0]
          };

          setFeedbacks(feedbacks.map(f => f.id === feedbackId ? updated : f));
          setSelectedFeedback(updated);
          alert('Feedback re-classified with Claude Sonnet successfully!');
          fetchThemes(); // Refresh themes in case a new theme was generated
        } else {
          alert('Re-classify failed: ' + data.message);
        }
        setReclassifying(false);
      })
      .catch(err => {
        console.error('Error re-classifying feedback:', err);
        alert('Re-classification failed.');
        setReclassifying(false);
      });
  };

  // CSV Ingestion file upload
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadMessage({ text: 'Reading CSV file...', type: 'info' });
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      setUploadMessage({ text: 'Uploading and parsing in progress...', type: 'info' });

      try {
        const res = await fetch(`${API_URL}/feedbacks/bulk-csv`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ csvText: text })
        });
        const data = await res.json();
        
        if (data.success) {
          setUploadMessage({
            text: `Import complete! Ingested: ${data.summary.success} records. Failed: ${data.summary.failed}.`,
            type: 'success'
          });
          setPage(1);
          fetchFeedbacks();
          fetchThemes();
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        setUploadMessage({ text: `Failed to import CSV: ${err.message}`, type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Simulate ingestion channel
  const handleSimulateIngest = () => {
    setSimulateLoading(true);
    fetch(`${API_URL}/feedbacks/simulate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(data.message);
          setPage(1);
          fetchFeedbacks();
          fetchThemes();
        } else {
          alert('Simulation failed: ' + data.message);
        }
        setSimulateLoading(false);
      })
      .catch(err => {
        console.error(err);
        setSimulateLoading(false);
      });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setChannelFilter('ALL');
    setSentimentFilter('ALL');
    setThemeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-400 text-glow-purple">
            Feedback Inbox
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Collect, triage, and organize customer support tickets, NPS comments, reviews, and logs.
          </p>
        </div>

        {/* Action Buttons */}
        {user?.role !== 'VIEWER' && (
          <div className="flex flex-wrap items-center gap-3">
            {/* CSV Import */}
            <label className="flex items-center space-x-1.5 cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Import CSV</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleCSVUpload} 
                className="hidden" 
              />
            </label>

            {/* Simulated Ingest */}
            <button
              onClick={handleSimulateIngest}
              disabled={simulateLoading}
              className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-gray-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-neon-purple transition-all"
            >
              <Flame className={`w-4 h-4 ${simulateLoading ? 'animate-pulse' : ''}`} />
              <span>{simulateLoading ? 'Ingesting Simulated Logs...' : 'Simulate Channels'}</span>
            </button>
          </div>
        )}
      </div>

      {/* CSV upload result dialog message */}
      {uploadMessage.text && (
        <div className={`px-4 py-3 rounded-xl text-xs font-semibold flex justify-between items-center border ${
          uploadMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
            : uploadMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{uploadMessage.text}</span>
          </div>
          <button onClick={() => setUploadMessage({ text: '', type: '' })} className="hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters & search panel */}
      <GlassPanel glowColor="none" className="p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Full text search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search content, title, label, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="md:col-span-1">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="ACTIONED">ACTIONED</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold py-2.5 rounded-xl text-xs transition-all shadow-neon-purple"
            >
              Apply Filter
            </button>
          </div>
        </form>

        <div className="h-px bg-white/5" />

        {/* Dynamic subfilters list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          {/* Channels dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Source Channel</span>
            <select
              value={channelFilter}
              onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Channels</option>
              <option value="Support ticket">Support ticket</option>
              <option value="App store review">App store review</option>
              <option value="NPS survey">NPS survey</option>
              <option value="Sales call note">Sales call note</option>
              <option value="Community post">Community post</option>
            </select>
          </div>

          {/* Sentiment dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Sentiment</span>
            <select
              value={sentimentFilter}
              onChange={(e) => { setSentimentFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Sentiments</option>
              <option value="POS">POS (Positive)</option>
              <option value="NEU">NEU (Neutral)</option>
              <option value="NEG">NEG (Negative)</option>
            </select>
          </div>

          {/* AI Themes dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">AI Theme Node</span>
            <select
              value={themeFilter}
              onChange={(e) => { setThemeFilter(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-2 text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Theme Nodes</option>
              {themesList.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none font-mono"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">End Date</span>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full bg-slate-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none font-mono"
              />
              <button 
                type="button"
                onClick={resetFilters}
                className="px-2 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Main Content Layout (Table listing + Sidebar details panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Inbox table column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-500 uppercase tracking-widest pl-1 font-mono">
            <span>Result Logs: {totalCount} total items</span>
            <span>Page {page} of {totalPages}</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-900/10 border border-white/5 rounded-2xl space-y-3">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-slate-500 uppercase">Syncing feedback tables...</span>
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <div 
                  key={fb.id}
                  onClick={() => setSelectedFeedback(fb)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    selectedFeedback?.id === fb.id 
                      ? 'bg-amber-500/10 border-amber-500/30' 
                      : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/7.5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center space-x-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          fb.sentiment === 'POS'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : fb.sentiment === 'NEG'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                              : 'bg-white/5 text-slate-300 border-white/10'
                        }`}>
                          {fb.sentiment === 'POS' ? <Smile className="w-2.5 h-2.5 text-emerald-400" /> : fb.sentiment === 'NEG' ? <Frown className="w-2.5 h-2.5 text-rose-400" /> : <Meh className="w-2.5 h-2.5 text-slate-400" />}
                          <span>{fb.sentiment} ({fb.sentimentScore})</span>
                        </span>
                        
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] bg-slate-900 border border-white/5 text-slate-400 font-semibold font-mono">
                          <Activity className="w-2.5 h-2.5 text-amber-500" />
                          <span>{fb.channel}</span>
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-slate-100">{fb.title}</h3>
                    </div>

                    {/* Inline Status workflow selector */}
                    <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                      {user?.role === 'VIEWER' ? (
                        <span className="text-[10px] font-mono border border-white/10 bg-white/5 px-2.5 py-1 rounded-lg text-slate-400">
                          {fb.status}
                        </span>
                      ) : (
                        <select
                          value={fb.status}
                          onChange={(e) => handleStatusChange(fb.id, e.target.value)}
                          className={`bg-slate-900 border text-[10px] font-bold font-mono px-2 py-1.5 rounded-lg focus:outline-none ${
                            fb.status === 'NEW' 
                              ? 'border-slate-500 text-slate-400' 
                              : fb.status === 'REVIEWED' 
                                ? 'border-amber-400 text-amber-300' 
                                : 'border-emerald-500 text-emerald-400'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="ACTIONED">ACTIONED</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{fb.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 pt-2 border-t border-white/5 font-mono">
                    <span className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-600" />
                      <span>Theme: <strong className="text-slate-400">{fb.category}</strong></span>
                    </span>
                    <span>Ref: {fb.sourceRef} | Date: {fb.date}</span>
                  </div>
                </div>
              ))}

              {/* Pagination controls */}
              <div className="flex items-center justify-between pt-4 text-xs font-semibold">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="flex items-center space-x-1.5 px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Prev Page</span>
                </button>
                
                <span className="text-slate-400 font-mono">Page {page} / {totalPages}</span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="flex items-center space-x-1.5 px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent rounded-xl transition-all"
                >
                  <span>Next Page</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <GlassPanel glowColor="none" className="text-center py-20">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-300">No feedbacks found</h3>
              <p className="text-slate-500 text-sm mt-1">Try relaxing your search terms or filter constraints.</p>
            </GlassPanel>
          )}
        </div>

        {/* Right AI Sidebar detailed panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">
            Claude AI Classification Detail
          </div>

          {selectedFeedback ? (
            <GlassPanel glowColor="cyan" className="p-6 space-y-6 animate-fade-in-up h-fit border-white/10">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                  <BrainCircuit className="w-4 h-4 text-amber-400" />
                  <span>AI Structured Nodes</span>
                </h4>
                <button 
                  onClick={() => setSelectedFeedback(null)}
                  className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rationale / Summary */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">One-Line Summary</label>
                <p className="text-xs text-slate-300 bg-white/2.5 border border-white/5 p-3.5 rounded-xl leading-relaxed">
                  {selectedFeedback.aiSummary}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Sentiment</label>
                  <span className={`inline-block mt-1 font-bold ${
                    selectedFeedback.sentiment === 'POS' ? 'text-emerald-400' : selectedFeedback.sentiment === 'NEG' ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {selectedFeedback.sentiment === 'POS' ? 'Positive' : selectedFeedback.sentiment === 'NEG' ? 'Negative' : 'Neutral'}
                  </span>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Sentiment Score</label>
                  <span className="block mt-1 font-mono font-bold text-slate-300">{selectedFeedback.sentimentScore}</span>
                </div>
              </div>

              {/* Feature Area */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">AI Feature Area</label>
                <div className="flex items-center space-x-1 text-xs text-slate-300">
                  <CornerDownRight className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold">{selectedFeedback.featureArea}</span>
                </div>
              </div>

              {/* Theme Mappings with confidence scores */}
              <div className="space-y-3">
                <label className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Theme Classification Mapping</label>
                <div className="space-y-2">
                  {selectedFeedback.themes.map((t, idx) => (
                    <div key={t.id || idx} className="flex items-center justify-between p-2 bg-slate-900 border border-white/5 rounded-lg text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                        <span className="font-bold text-slate-200 truncate">{t.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        Conf: {Math.round(t.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Re-classify action */}
              {user?.role !== 'VIEWER' && (
                <button
                  onClick={() => handleReclassify(selectedFeedback.id)}
                  disabled={reclassifying}
                  className="w-full mt-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <Cpu className={`w-4 h-4 ${reclassifying ? 'animate-spin' : ''}`} />
                  <span>{reclassifying ? 'Re-Classifying...' : 'Re-Run AI Classification'}</span>
                </button>
              )}
            </GlassPanel>
          ) : (
            <GlassPanel glowColor="none" className="flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10 h-64 text-slate-500 font-mono text-xs">
              <Cpu className="w-8 h-8 text-slate-700 mb-2" />
              <span>Select feedback card to view AI analysis taxonomy mapping.</span>
            </GlassPanel>
          )}
        </div>

      </div>
    </div>
  );
};

export default Inbox;
