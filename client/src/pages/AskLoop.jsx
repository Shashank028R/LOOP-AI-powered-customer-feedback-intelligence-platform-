import React, { useState } from 'react';
import GlassPanel from '../components/GlassPanel';
import { Send, BrainCircuit, Sparkles, AlertCircle, ShieldAlert, Cpu, BarChart3 } from 'lucide-react';

const AskLoop = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleClassify = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setResult(null);

    // Simulate calling the server endpoint which invokes the aiService.js
    setTimeout(() => {
      // Analyze text for mock classification
      const content = inputText.toLowerCase();
      let category = 'General Feedback';
      let tags = ['feedback'];
      let sentiment = 'Neutral';
      let urgency = 'Medium';
      let summary = 'Customer provided reviews regarding workspace capabilities.';
      let confidence = '95.4%';

      if (content.includes('slow') || content.includes('crash') || content.includes('bug') || content.includes('error')) {
        category = 'Bug Report';
        tags = ['bug', 'performance', 'stability'];
        sentiment = 'Negative';
        urgency = 'High';
        summary = 'User reports potential performance and application errors.';
        confidence = '98.7%';
      } else if (content.includes('add') || content.includes('feature') || content.includes('want') || content.includes('button') || content.includes('theme')) {
        category = 'Feature Request';
        tags = ['enhancement', 'ui', 'ux'];
        sentiment = 'Positive';
        urgency = 'Low';
        summary = 'User suggests user experience enhancements and design customizability.';
        confidence = '97.2%';
      }

      setResult({
        category,
        tags,
        sentiment,
        urgency,
        summary,
        confidence,
        rawText: inputText
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-glow-purple">
          Ask LOOP AI
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Utilize Anthropic Claude models to parse, summarize, and categorize unstructured feedback text automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Input Column */}
        <div className="lg:col-span-3 space-y-6">
          <GlassPanel glowColor="purple">
            <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <span>Input Raw Customer Logs</span>
            </h3>
            
            <form onSubmit={handleClassify} className="space-y-4">
              <div className="relative">
                <textarea
                  rows="6"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste email logs, support tickets, or user messages here..."
                  className="w-full bg-white/5 border border-white/5 focus:border-purple-500/50 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500/25 transition-all resize-none"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Cpu className="w-3.5 h-3.5 text-slate-600" />
                  <span>Model: Claude 3.5 Sonnet</span>
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 disabled:from-purple-500/50 disabled:to-cyan-500/50 disabled:cursor-not-allowed text-gray-950 font-bold px-5 py-2 rounded-xl shadow-neon-purple transition-all duration-300 text-sm hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-950 border-t-transparent rounded-full animate-spin" />
                      <span>Classifying...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Classify Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </GlassPanel>

          {/* Quick Sandbox templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => setInputText('Hey LOOP team, your application is running extremely slow when opening the main dashboards page. Sometimes it throws 504 timeout errors. Please investigate.')}
              className="p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/20 transition-all cursor-pointer text-xs"
            >
              <div className="font-semibold text-slate-300 flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Preset: Bug Report Log</span>
              </div>
              <p className="text-slate-400 mt-2 truncate">Hey LOOP team, your application is running extremely slow...</p>
            </div>

            <div 
              onClick={() => setInputText('Could you please add support for custom color theme pickers inside our dashboard settings page? The default neon works great but branding needs customization.')}
              className="p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-cyan-500/20 transition-all cursor-pointer text-xs"
            >
              <div className="font-semibold text-slate-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Preset: Feature Request Log</span>
              </div>
              <p className="text-slate-400 mt-2 truncate">Could you please add support for custom color theme pickers...</p>
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-2">
          {result ? (
            <GlassPanel glowColor="cyan" className="h-full flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Claude Taxonomy Output</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Confidence: {result.confidence}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Assigned Category</label>
                    <span className="text-sm font-bold text-slate-200 mt-1 inline-block">{result.category}</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block">AI Generated Summary</label>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{result.summary}</p>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wider block">Keywords / Tags</label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {result.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-purple-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Sentiment</span>
                    <span className={`font-semibold mt-1 inline-block ${
                      result.sentiment === 'Positive' ? 'text-emerald-400' : result.sentiment === 'Negative' ? 'text-rose-400' : 'text-slate-300'
                    }`}>{result.sentiment}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Urgency</span>
                    <span className={`font-semibold mt-1 inline-block ${
                      result.urgency === 'High' ? 'text-rose-400' : 'text-slate-300'
                    }`}>{result.urgency}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  alert('Feedback has been saved and injected into workspace database.');
                  setResult(null);
                  setInputText('');
                }}
                className="w-full mt-6 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 py-2.5 rounded-xl font-semibold text-xs transition-colors"
              >
                Approve & Save Feedback
              </button>
            </GlassPanel>
          ) : (
            <GlassPanel glowColor="none" className="h-full flex flex-col items-center justify-center text-center p-8 border-dashed border-white/10">
              <Cpu className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-300">Ready for Classification</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed max-w-[200px]">
                Input logs and hit submit to view structured taxonomy output.
              </p>
            </GlassPanel>
          )}
        </div>

      </div>
    </div>
  );
};

export default AskLoop;
