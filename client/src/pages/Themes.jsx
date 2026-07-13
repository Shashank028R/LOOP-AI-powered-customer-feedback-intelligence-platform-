import React, { useState } from 'react';
import GlassPanel from '../components/GlassPanel';
import { Palette, Check, RefreshCw, Eye, Sparkles } from 'lucide-react';

const Themes = () => {
  const [activeTheme, setActiveTheme] = useState('cyberpunk');
  const [primaryColor, setPrimaryColor] = useState('#c084fc');
  const [secondaryColor, setSecondaryColor] = useState('#22d3ee');

  const themes = [
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Neon',
      desc: 'Translucent dark slate with vibrant high-glow neon outputs.',
      primary: '#c084fc', // purple
      secondary: '#22d3ee', // cyan
      background: '#030712',
      glow: 'shadow-neon-purple'
    },
    {
      id: 'synthwave',
      name: 'Synthwave Glow',
      desc: 'Deep magenta gradients paired with hot sunset pink and neon orange highlights.',
      primary: '#ec4899', // pink
      secondary: '#f97316', // orange
      background: '#0c0415',
      glow: 'shadow-neon-pink'
    },
    {
      id: 'matrix',
      name: 'Neural Terminal',
      desc: 'Classic monochrome green phosphorus terminal layout.',
      primary: '#22c55e', // green
      secondary: '#86efac', // light green
      background: '#022c22',
      glow: 'shadow-[0_0_10px_rgba(34,197,94,0.4)]'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-glow-purple">
          Workspace Themes
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Customize the aesthetic of your tenant panel. Changes update immediately for all active workspace viewers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Theme Selectors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {themes.map((theme) => (
              <GlassPanel 
                key={theme.id} 
                glowColor={theme.id === 'cyberpunk' ? 'purple' : theme.id === 'synthwave' ? 'pink' : 'cyan'}
                className={`relative cursor-pointer transition-all border ${
                  activeTheme === theme.id 
                    ? 'border-purple-500 bg-purple-500/5' 
                    : 'border-white/5 hover:border-white/10'
                }`}
                onClick={() => {
                  setActiveTheme(theme.id);
                  setPrimaryColor(theme.primary);
                  setSecondaryColor(theme.secondary);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-100 flex items-center space-x-2">
                      <span>{theme.name}</span>
                      {activeTheme === theme.id && <Sparkles className="w-4 h-4 text-purple-400" />}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{theme.desc}</p>
                  </div>
                  {activeTheme === theme.id && (
                    <span className="bg-purple-500 text-gray-950 p-1 rounded-full shadow-neon-purple shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Swatches indicator */}
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-white/5">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.background }} />
                  <span className="text-[10px] text-slate-500 font-mono uppercase ml-auto">Preset colors</span>
                </div>
              </GlassPanel>
            ))}
          </div>

          {/* Color pickers card */}
          <GlassPanel glowColor="none">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Palette className="w-4.5 h-4.5 text-purple-400" />
              <span>Custom Brand Palette Override</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Primary Brand Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="w-10 h-10 bg-transparent border-0 rounded cursor-pointer shrink-0 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-purple-500 w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Secondary Highlight Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)} 
                    className="w-10 h-10 bg-transparent border-0 rounded cursor-pointer shrink-0 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)} 
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-cyan-500 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-white/5">
              <button 
                onClick={() => {
                  const currentPreset = themes.find(t => t.id === activeTheme);
                  setPrimaryColor(currentPreset.primary);
                  setSecondaryColor(currentPreset.secondary);
                }}
                className="flex items-center space-x-1.5 px-4 py-2 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl text-slate-300 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Preset</span>
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-gray-950 font-bold text-xs rounded-xl shadow-neon-purple transition-all hover:scale-102">
                Save Palette Settings
              </button>
            </div>
          </GlassPanel>
        </div>

        {/* Live Preview Panel */}
        <div className="space-y-6">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Live Preview Simulator</div>
          <div 
            className="rounded-2xl p-6 border transition-all duration-500 flex flex-col justify-between h-80"
            style={{ 
              borderColor: `${primaryColor}25`, 
              boxShadow: `0 0 25px ${primaryColor}08`,
              backgroundColor: '#070a13'
            }}
          >
            <div className="space-y-4">
              {/* Fake navbar header preview */}
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-sm font-extrabold tracking-wider" style={{ color: primaryColor }}>PROJECT LOOP</span>
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: secondaryColor }} />
              </div>

              {/* Sample card inside simulated browser */}
              <div className="rounded-xl p-4 bg-white/5 border border-white/5 space-y-2">
                <div className="w-2/3 h-2 rounded bg-slate-700" />
                <div className="w-full h-10 rounded-lg bg-slate-800/50 border flex items-center px-3" style={{ borderColor: `${secondaryColor}25` }}>
                  <span className="text-[10px]" style={{ color: secondaryColor }}>Simulated widget active preview.</span>
                </div>
              </div>
            </div>

            {/* simulated actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[10px] text-slate-500">Subdomain: demo.loop.io</span>
              <button 
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-950 flex items-center space-x-1"
                style={{ backgroundColor: primaryColor }}
              >
                <Eye className="w-3 h-3 stroke-[2.5]" />
                <span>Interact</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Themes;
