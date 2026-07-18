import React, { useState, useRef, useEffect } from 'react';
import { useAuth, API_URL } from '../AuthContext';
import GlassPanel from '../components/GlassPanel';
import { 
  Send, 
  BrainCircuit, 
  Sparkles, 
  AlertCircle, 
  Cpu,
  User,
  Calendar,
  Tag,
  BookOpen,
  ArrowUpRight,
  Smile,
  Frown,
  Meh,
  X
} from 'lucide-react';

const AskLoop = () => {
  const { token } = useAuth();
  
  // Chat history list state
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Welcome to Ask LOOP Grounded Intelligence! 🧠\n\nAsk me any question regarding your workspace customer feedback (e.g. \"What are users saying about onboarding?\" or \"Do we have complaints about latency?\"). I will retrieve relevant logs and write a grounded answer citing the feedback logs.",
      citations: []
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll chat window to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend.trim();
    if (!query) return;

    setInputText('');
    setError('');

    // Append User Message
    const userMessage = { sender: 'user', text: query, citations: [] };
    setMessages(prev => [...prev, userMessage]);
    
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/insights/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ question: query })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch AI answer');
      }

      // Append AI reply
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: data.answer,
        citations: data.citations || []
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: `⚠️ **Error occurred while running RAG pipeline**: ${err.message}. Please verify your server connection or API keys.`,
        citations: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const [error, setError] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const presets = [
    "What are users saying about onboarding?",
    "Are there any complaints about latency or speed?",
    "What billing and pricing issues are being reported?",
    "Do we have feature requests for slack webhooks?"
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-amber-400 text-glow-purple">
          Ask LOOP AI (Grounded Q&A)
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Chat with your feedback logs. Anthropic Claude will analyze vector-search results to generate factual, hallucination-free answers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-230px)]">
        
        {/* Left Chat column */}
        <div className="lg:col-span-3 flex flex-col h-full space-y-4">
          
          {/* Chat message logs */}
          <GlassPanel glowColor="purple" className="flex-1 p-6 overflow-y-auto flex flex-col space-y-4 scrollbar-thin">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex space-x-3.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'self-end flex-row-reverse space-x-reverse' : 'self-start'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
                </div>

                <div className="space-y-3">
                  {/* Message body */}
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-slate-100 rounded-tr-none'
                      : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none'
                  }`}>
                    {/* Render newlines */}
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={line ? 'mb-2' : 'h-3'} style={{ whiteSpace: 'pre-wrap' }}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Render citations inline */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-2 pl-2">
                      <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest flex items-center space-x-1">
                        <BookOpen className="w-3 h-3 text-cyan-400" />
                        <span>Retrieved Grounding Sources ({msg.citations.length})</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cit, cIdx) => (
                          <button
                            key={cit.id || cIdx}
                            onClick={() => setSelectedCitation(cit)}
                            className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/2.5 hover:bg-white/5 border border-white/5 hover:border-cyan-500/25 text-[10px] text-slate-300 rounded-lg transition-all"
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cit.sentiment === 'POS' ? '#10b981' : cit.sentiment === 'NEG' ? '#f43f5e' : '#6b7280' }} />
                            <span className="max-w-[120px] truncate">{cit.title}</span>
                            <ArrowUpRight className="w-3 h-3 text-slate-500" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ))}

            {/* Loading / Typing indicator */}
            {loading && (
              <div className="flex space-x-3.5 self-start items-center">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-slate-500 font-mono uppercase ml-2">Claude compiling citations...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </GlassPanel>

          {/* Form text input box */}
          <form onSubmit={handleFormSubmit} className="flex items-center space-x-3">
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Ask a question about your logs..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-gray-950 font-bold p-3 rounded-xl shadow-neon-purple transition-all shrink-0"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Right suggestions column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">
            Suggested Queries
          </div>

          <div className="space-y-3">
            {presets.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => !loading && handleSendMessage(preset)}
                className={`p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/7.5 hover:border-amber-500/20 transition-all cursor-pointer text-xs text-slate-300 leading-normal ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{preset}</span>
              </div>
            ))}
          </div>

          <GlassPanel glowColor="none" className="p-4 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-bold">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Grounded Guarantee</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              LOOP answers questions using only workspace feedback contexts retrieved via cosine similarity vectors. If answers are not found, it declines to hallucinate details.
            </p>
          </GlassPanel>
        </div>

      </div>

      {/* Citation Detail dialog popup modal */}
      {selectedCitation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
          <GlassPanel glowColor="cyan" className="max-w-lg w-full mx-4 relative border border-white/10 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Source citation verification</span>
              </h3>
              <button 
                onClick={() => setSelectedCitation(null)}
                className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-bold text-slate-100">{selectedCitation.title}</h4>
                <span className={`shrink-0 flex items-center space-x-1 text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                  selectedCitation.sentiment === 'POS'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : selectedCitation.sentiment === 'NEG'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                      : 'bg-white/5 text-slate-300 border-white/10'
                }`}>
                  {selectedCitation.sentiment === 'POS' ? <Smile className="w-3 h-3 text-emerald-400" /> : selectedCitation.sentiment === 'NEG' ? <Frown className="w-3 h-3 text-rose-400" /> : <Meh className="w-3 h-3 text-slate-400" />}
                  <span>Score: {selectedCitation.sentimentScore}</span>
                </span>
              </div>

              <div className="bg-white/2.5 border border-white/5 p-4 rounded-xl text-xs text-slate-300 leading-relaxed font-normal max-h-48 overflow-y-auto">
                {selectedCitation.description}
              </div>

              <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-500 font-mono border-t border-white/5 pt-3">
                <div>
                  <span className="block text-[8px] uppercase text-slate-500">Source channel</span>
                  <strong className="text-slate-300">{selectedCitation.channel}</strong>
                </div>
                <div>
                  <span className="block text-[8px] uppercase text-slate-500">Ingested on</span>
                  <strong className="text-slate-300">{selectedCitation.date}</strong>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}

    </div>
  );
};

export default AskLoop;
