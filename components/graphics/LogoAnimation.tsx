"use client";

import { useState, useEffect } from 'react';

interface LogoAnimationProps {
  className?: string;
  enableScrollAnimation?: boolean;
  rotationSpeed?: number;
  maxScroll?: number;
}

export default function LogoAnimation({ 
  className = "",
  enableScrollAnimation = true,
  rotationSpeed = 0.5,
  maxScroll = 500
}: LogoAnimationProps) {
  const [scrollRotation, setScrollRotation] = useState(0);
  

  useEffect(() => {
    if (!enableScrollAnimation) return;

    const handleScroll = () => {
      // Scroll pozisyonuna göre rotasyon açısını hesapla
      const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const rotation = scrollY * rotationSpeed; // Her pixel scroll için belirlenen derece dönüş
      setScrollRotation(rotation);
    };
    
    // Multiple event listeners to ensure we catch scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    document.documentElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call to set rotation
    handleScroll();
    
    // Also listen for wheel events as fallback
    const handleWheel = () => {
      setTimeout(handleScroll, 10);
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      document.documentElement.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [enableScrollAnimation, rotationSpeed]);

  // Scale hesaplama - scroll 0'da scale 0, scroll arttıkça 0.8'e ulaşır (daha küçük max boyut)
  const scale = Math.min(scrollRotation / (maxScroll * 0.5), 1) * 0.8;

  return (
    <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none ${className}`}>
      {/* Clean logo without any effects */}
      <img
        src="/images/home/SVG/logo_icon.svg"
        alt="RadioApex Logo"
        className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 transition-transform duration-100"
        style={{ 
          transform: `rotate(${scrollRotation}deg) scale(${scale})`,
          opacity: 0.2
        }}
        onError={(e) => {
          e.currentTarget.src = "/images/home/logo.png";
        }}
      />
    </div>
  );
}
