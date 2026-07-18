import React, { useState, useEffect } from 'react';
import GlassPanel from '../components/GlassPanel';
import { Palette, Check, RefreshCw, Eye, Sparkles } from 'lucide-react';

const Themes = () => {
  const [activeTheme, setActiveTheme] = useState('royalgold');
  const [primaryColor, setPrimaryColor] = useState('#d4af37');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#050a18');

  const themes = [
    {
      id: 'royalgold',
      name: 'Royal Gold & Navy',
      desc: 'Premium deep dark blue glass panels paired with elegant metallic gold accents.',
      primary: '#d4af37', // Gold
      secondary: '#ffffff', // White
      background: '#050a18',
      glow: 'shadow-neon-purple'
    },
    {
      id: 'midnightfrost',
      name: 'Midnight Frost',
      desc: 'Brushed charcoal background accompanied by pristine white and silver-gray highlights.',
      primary: '#f8fafc', // White
      secondary: '#94a3b8', // Gray
      background: '#0a1128',
      glow: 'shadow-neon-cyan'
    },
    {
      id: 'brushedbronze',
      name: 'Obsidian Eclipse',
      desc: 'Deep obsidian black layout matching warm bronze and platinum details.',
      primary: '#dfb76c', // Bronze
      secondary: '#aa842c', // Dark Gold
      background: '#080808',
      glow: 'shadow-neon-pink'
    }
  ];

  // Fetch active theme on mount
  useEffect(() => {
    fetch('http://localhost:5050/api/themes')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.theme) {
          setPrimaryColor(data.theme.primaryColor);
          setSecondaryColor(data.theme.secondaryColor);
          setBgColor(data.theme.backgroundColor);

          // Attempt to match with preset themes
          const match = themes.find(t => t.primary.toLowerCase() === data.theme.primaryColor.toLowerCase() && t.background.toLowerCase() === data.theme.backgroundColor.toLowerCase());
          if (match) {
            setActiveTheme(match.id);
          } else {
            setActiveTheme('custom');
          }
        }
      })
      .catch(err => console.error('Error fetching theme page mount:', err));
  }, []);

  // Set style variables in root
  const updateThemePreview = (primary, secondary, bg) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-secondary', secondary);
    root.style.setProperty('--color-bg', bg);
    root.style.setProperty('--color-accent', primary + 'cc');
  };

  const handleSaveTheme = () => {
    const matchedPreset = themes.find(t => t.id === activeTheme);
    const themeName = matchedPreset ? matchedPreset.name : 'Custom Brand Theme';

    fetch('http://localhost:5050/api/themes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: themeName,
        primaryColor,
        secondaryColor,
        backgroundColor: bgColor
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Theme settings saved and synced dynamically!');
          updateThemePreview(primaryColor, secondaryColor, bgColor);
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(err => {
        console.error('Error saving theme:', err);
        alert('Failed to connect to backend server.');
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-amber-400 text-glow-purple">
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
                glowColor={theme.id === 'royalgold' ? 'purple' : theme.id === 'brushedbronze' ? 'pink' : 'cyan'}
                className={`relative cursor-pointer transition-all border ${
                  activeTheme === theme.id 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : 'border-white/5 hover:border-white/10'
                }`}
                onClick={() => {
                  setActiveTheme(theme.id);
                  setPrimaryColor(theme.primary);
                  setSecondaryColor(theme.secondary);
                  setBgColor(theme.background);
                  updateThemePreview(theme.primary, theme.secondary, theme.background);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-100 flex items-center space-x-2">
                      <span>{theme.name}</span>
                      {activeTheme === theme.id && <Sparkles className="w-4 h-4 text-amber-400" />}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{theme.desc}</p>
                  </div>
                  {activeTheme === theme.id && (
                    <span className="bg-amber-500 text-gray-950 p-1 rounded-full shadow-neon-purple shrink-0">
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
              <Palette className="w-4.5 h-4.5 text-amber-400" />
              <span>Custom Brand Palette Override</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Primary Brand Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setActiveTheme('custom');
                      updateThemePreview(e.target.value, secondaryColor, bgColor);
                    }} 
                    className="w-10 h-10 bg-transparent border-0 rounded cursor-pointer shrink-0 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setActiveTheme('custom');
                      updateThemePreview(e.target.value, secondaryColor, bgColor);
                    }} 
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-amber-500 w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Secondary Highlight Color</label>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={secondaryColor} 
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      setActiveTheme('custom');
                      updateThemePreview(primaryColor, e.target.value, bgColor);
                    }} 
                    className="w-10 h-10 bg-transparent border-0 rounded cursor-pointer shrink-0 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    value={secondaryColor} 
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      setActiveTheme('custom');
                      updateThemePreview(primaryColor, e.target.value, bgColor);
                    }} 
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-amber-400 w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-white/5">
              <button 
                onClick={() => {
                  const currentPreset = themes.find(t => t.id === activeTheme);
                  if (currentPreset) {
                    setPrimaryColor(currentPreset.primary);
                    setSecondaryColor(currentPreset.secondary);
                    setBgColor(currentPreset.background);
                    updateThemePreview(currentPreset.primary, currentPreset.secondary, currentPreset.background);
                  }
                }}
                className="flex items-center space-x-1.5 px-4 py-2 border border-white/10 hover:bg-white/5 text-xs font-semibold rounded-xl text-slate-300 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Preset</span>
              </button>
              <button 
                onClick={handleSaveTheme}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs rounded-xl shadow-neon-purple transition-all hover:scale-102"
              >
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
              backgroundColor: bgColor
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
