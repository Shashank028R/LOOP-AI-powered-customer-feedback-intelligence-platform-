import React from 'react';

const GlassPanel = ({ children, className = '', glowColor = 'purple', hoverEffect = true }) => {
  const glowClasses = {
    purple: 'hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(212,175,55,0.12)]',
    cyan: 'hover:border-amber-400/30 hover:shadow-[0_0_15px_rgba(223,183,108,0.12)]',
    pink: 'hover:border-slate-200/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]',
    none: ''
  };

  return (
    <div className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${
      hoverEffect ? 'hover:-translate-y-0.5 ' + glowClasses[glowColor] : ''
    } ${className}`}>
      {children}
    </div>
  );
};

export default GlassPanel;
