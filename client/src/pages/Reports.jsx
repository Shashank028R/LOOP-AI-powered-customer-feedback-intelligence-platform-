import React from 'react';
import GlassPanel from '../components/GlassPanel';
import { BarChart3, Download, TrendingUp, HelpCircle, CheckCircle, PieChart, ArrowUpRight } from 'lucide-react';

const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-glow-purple">
            Workspace Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Download and analyze workspace feedback distributions and AI taxonomy performance logs.
          </p>
        </div>
        <button 
          onClick={() => alert('Downloading report file loop-analytics-report.pdf ...')}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-gray-950 font-bold px-4 py-2 rounded-xl shadow-neon-purple transition-all text-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* Grid of metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel glowColor="purple" className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Average Sentiment Score</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">+82.4</span>
            <span className="text-[10px] text-emerald-500 block font-semibold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              <span>+3.2% increase</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 flex items-center justify-center bg-emerald-500/5 text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </GlassPanel>

        <GlassPanel glowColor="cyan" className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Claude Tag Accuracy</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">98.6%</span>
            <span className="text-[10px] text-slate-400 block font-semibold flex items-center">
              <span>941 validated tags</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 flex items-center justify-center bg-cyan-500/5 text-cyan-400">
            <BarChart3 className="w-6 h-6" />
          </div>
        </GlassPanel>

        <GlassPanel glowColor="pink" className="flex items-center justify-between p-6">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Feedback Response SLA</span>
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-100">4.2 hrs</span>
            <span className="text-[10px] text-rose-400 block font-semibold flex items-center">
              <span>-1.1 hr reduction</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-pink-500/20 flex items-center justify-center bg-pink-500/5 text-pink-400">
            <PieChart className="w-6 h-6" />
          </div>
        </GlassPanel>
      </div>

      {/* CSS-only Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Table representation */}
        <GlassPanel glowColor="none">
          <h3 className="text-base font-bold text-slate-100 mb-4">Category breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400 border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'Feature Requests', count: 184, ratio: '49%' },
                  { name: 'Bug Reports', count: 112, ratio: '30%' },
                  { name: 'Billing', count: 56, ratio: '15%' },
                  { name: 'Other / General', count: 22, ratio: '6%' }
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{row.name}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{row.count}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-purple-400 font-mono">{row.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* Progress bar / distribution indicator */}
        <GlassPanel glowColor="purple" className="flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-6">Distribution Bar Chart</h3>
            
            <div className="space-y-5">
              {[
                { name: 'Feature Requests', percentage: 49, color: 'bg-purple-500 shadow-neon-purple' },
                { name: 'Bug Reports', percentage: 30, color: 'bg-cyan-500 shadow-neon-cyan' },
                { name: 'Billing', percentage: 15, color: 'bg-pink-500 shadow-neon-pink' },
                { name: 'General', percentage: 6, color: 'bg-slate-500' }
              ].map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">{category.name}</span>
                    <span className="font-mono text-slate-400 font-bold">{category.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      style={{ width: `${category.percentage}%` }} 
                      className={`h-full rounded-full transition-all duration-1000 ${category.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 mt-6 pt-4 flex justify-between items-center text-xs text-slate-400">
            <span>Aggregations updated hourly.</span>
            <span className="flex items-center text-purple-400 font-semibold cursor-pointer hover:underline">
              <span>View details</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </GlassPanel>

      </div>
    </div>
  );
};

export default Reports;
