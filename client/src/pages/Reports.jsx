import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../AuthContext';
import GlassPanel from '../components/GlassPanel';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  HelpCircle, 
  CheckCircle, 
  PieChart, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  FileText,
  Clock,
  ChevronRight,
  TrendingDown,
  Smile,
  Frown,
  Meh
} from 'lucide-react';

const Reports = () => {
  const { token, user } = useAuth();
  
  // Reports history list
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingList, setLoadingList] = useState(true);

  // New report form settings
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [generateLoading, setGenerateLoading] = useState(false);

  const fetchReports = (selectLatest = false) => {
    setLoadingList(true);
    fetch(`${API_URL}/reports`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReports(data.reports);
          if (data.reports.length > 0) {
            if (selectLatest || !selectedReport) {
              setSelectedReport(data.reports[0]);
            } else {
              // Sync selected report
              const current = data.reports.find(r => r._id === selectedReport._id);
              if (current) setSelectedReport(current);
            }
          }
        }
        setLoadingList(false);
      })
      .catch(err => {
        console.error('Error fetching reports:', err);
        setLoadingList(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setGenerateLoading(true);

    try {
      const res = await fetch(`${API_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          title: customTitle || undefined
        })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Report generation failed');
      }

      alert('Voice-of-Customer report generated and saved successfully!');
      setCustomTitle('');
      setStartDate('');
      setEndDate('');
      setSelectedReport(data.report);
      fetchReports(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerateLoading(false);
    }
  };

  // Helper to parse inline markdown styles like bold text (**bold**)
  const parseInlineStyles = (text) => {
    if (!text) return '';
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    const elements = [];
    let lastIndex = 0;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }
      elements.push(<strong key={match.index} className="font-bold text-slate-100">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    return elements.length > 0 ? elements : text;
  };

  // Simple Markdown Parser to render generated report nicely
  const renderMarkdown = (mdText) => {
    if (!mdText) return null;
    return mdText.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-amber-400 mt-6 mb-3 tracking-wide">{parseInlineStyles(trimmed.replace('# ', ''))}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} className="text-base font-bold text-slate-100 mt-5 mb-2.5 border-b border-white/5 pb-1">{parseInlineStyles(trimmed.replace('## ', ''))}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-semibold text-slate-200 mt-4 mb-2">{parseInlineStyles(trimmed.replace('### ', ''))}</h3>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return <li key={idx} className="text-slate-300 ml-4 list-disc mb-1 leading-relaxed text-xs">{parseInlineStyles(trimmed.replace(/^[-*]\s+/, ''))}</li>;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        return <li key={idx} className="text-slate-300 ml-4 list-decimal mb-1 leading-relaxed text-xs">{parseInlineStyles(trimmed.replace(/^\d+\.\s+/, ''))}</li>;
      }
      if (trimmed) {
        return <p key={idx} className="text-slate-300 mb-3 leading-relaxed text-xs">{parseInlineStyles(trimmed)}</p>;
      }
      return <div key={idx} className="h-3" />;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic print stylesheet for PDF exports */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            color: black !important;
            background: white !important;
          }
          #print-area h1, #print-area h2, #print-area h3, #print-area h4 {
            color: black !important;
            text-shadow: none !important;
            border-color: #ddd !important;
          }
          #print-area p, #print-area li, #print-area span, #print-area td, #print-area th {
            color: #333 !important;
          }
          #print-area select, #print-area button, #print-area input, #print-area form, #print-area .no-print {
            display: none !important;
          }
          .glass-panel {
            background: white !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-amber-400 text-glow-purple">
            Voice of Customer Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate weekly narrative digests, inspect aggregate sentiment shifts, and export documents as PDF.
          </p>
        </div>
        
        {selectedReport && (
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-4 py-2.5 rounded-xl shadow-neon-purple transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left side: Report generator and logs list */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Generate Panel (ADMIN/ANALYST only) */}
          {user?.role !== 'VIEWER' && (
            <GlassPanel glowColor="purple" className="p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 font-mono">Generate Weekly VoC</h3>
              
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold uppercase">Report Custom Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Weekly Digest"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold uppercase">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 font-semibold uppercase">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={generateLoading}
                  className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-gray-950 font-bold py-2 rounded-xl text-xs shadow-neon-purple transition-all flex items-center justify-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generateLoading ? 'AI Generating...' : 'Run Digest Engine'}</span>
                </button>
              </form>
            </GlassPanel>
          )}

          {/* History log list */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Historical Reports</div>
            
            {loadingList ? (
              <div className="flex flex-col items-center justify-center py-10 bg-white/2.5 rounded-xl border border-white/5 space-y-2">
                <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-slate-500 font-mono">Syncing history...</span>
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                {reports.map((rep) => (
                  <div
                    key={rep._id}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedReport?._id === rep._id
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/5 border-white/5 hover:bg-white/7.5'
                    }`}
                  >
                    <div className="space-y-1 pr-2 min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-100 truncate">{rep.title}</h4>
                      <div className="flex items-center space-x-1 text-[9px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-white/5 bg-white/2.5 rounded-xl text-slate-500 text-[10px] font-mono leading-relaxed">
                No reports compiled yet. Select a date range to generate.
              </div>
            )}
          </div>

        </div>

        {/* Right side: Report viewer sheet */}
        <div className="lg:col-span-3 h-full">
          {selectedReport ? (
            <div id="print-area">
              <GlassPanel glowColor="cyan" className="p-8 space-y-6 h-[680px] overflow-y-auto border-white/10">
                
                {/* Executive Cover Header */}
                <div className="border-b border-white/10 pb-5 space-y-2 relative">
                  <div className="text-[9px] font-bold font-mono tracking-widest text-amber-500 uppercase">
                    LOOP AI VOICE OF CUSTOMER EXECUTIVE SUMMARY
                  </div>
                  <h2 className="text-2xl font-black text-slate-100 leading-tight">
                    {selectedReport.title}
                  </h2>
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono pt-2">
                    <span>Generated by: <strong className="text-slate-300 font-semibold">{selectedReport.generatedBy?.name || 'Workspace Lead'}</strong> ({selectedReport.generatedBy?.role})</span>
                    <span>Range: {new Date(selectedReport.periodStart).toLocaleDateString()} - {new Date(selectedReport.periodEnd).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Print label */}
                  <div className="hidden print:block absolute right-0 top-0 border border-black p-1 text-[9px] font-bold">
                    CONFIDENTIAL
                  </div>
                </div>

                {/* Compiled statistics badges */}
                {selectedReport.contentJson && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-white/5 bg-white/2.5 p-4 rounded-2xl no-print">
                    <div className="text-center sm:text-left space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Feedbacks Analyzed</span>
                      <span className="text-xl font-extrabold font-mono text-slate-200">{selectedReport.contentJson.totalCount} items</span>
                    </div>

                    <div className="text-center sm:text-left space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-4">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Sentiment Shifts</span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center justify-center sm:justify-start">
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                        <span>{selectedReport.contentJson.sentimentShift}</span>
                      </span>
                    </div>

                    <div className="text-center sm:text-left space-y-1 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-4">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Volume Distribution</span>
                      <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-[9px] font-bold font-mono pt-1">
                        <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10">POS: {selectedReport.contentJson.posPercent}%</span>
                        <span className="text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded border border-slate-500/10">NEU: {selectedReport.contentJson.neuPercent}%</span>
                        <span className="text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/10">NEG: {selectedReport.contentJson.negPercent}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Markdown text narrative view */}
                <div className="prose prose-invert max-w-none text-slate-300">
                  {renderMarkdown(selectedReport.narrative)}
                </div>

              </GlassPanel>
            </div>
          ) : (
            <GlassPanel glowColor="none" className="flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10 h-full min-h-[400px] text-slate-500 font-mono text-xs">
              <FileText className="w-12 h-12 text-slate-700 mb-3 animate-pulse" />
              <h3 className="font-bold text-slate-300 text-sm">No Active Report Selected</h3>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Choose a historical report log or generate a new weekly digest using the left settings control panel.
              </p>
            </GlassPanel>
          )}
        </div>

      </div>
    </div>
  );
};

export default Reports;
