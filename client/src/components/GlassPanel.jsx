import React from 'react';

const GlassPanel = ({ children, className = '', glowColor = 'purple', hoverEffect = true }) => {
  const glowClasses = {
    purple: 'hover:border-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.12)]',
    cyan: 'hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.12)]',
    pink: 'hover:border-pink-500/30 hover:shadow-[0_0_15px_rgba(244,63,94,0.12)]',
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
