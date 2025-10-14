"use client";

import React from 'react';

interface FeelGoodTickerProps {
  direction?: 'left' | 'right';
  speed?: 'slow' | 'medium' | 'fast';
  className?: string;
}

export default function FeelGoodTicker({ 
  direction = 'left', 
  speed = 'slow',
  className = '' 
}: FeelGoodTickerProps) {
  return (
    <div className={`w-full ${className}`}>
      <div 
        className="text-[120px] font-bold text-[#FD1D35] whitespace-nowrap"
        style={{
          color: '#FD1D35',
          fontSize: '120px',
          fontWeight: 'bold'
        }}
      >
        FEEL GOOD SOUND. FEEL GOOD SOUND. FEEL GOOD SOUND.
      </div>
    </div>
  );
}
