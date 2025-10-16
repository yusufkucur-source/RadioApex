"use client";

import { m } from "framer-motion";
import { useNowPlaying } from "@/components/now-playing/NowPlayingProvider";

export default function Footer() {
  const { nowPlaying, isLoading } = useNowPlaying();

  const displayText = isLoading
    ? "RADIO APEX - LIVE"
    : `${(nowPlaying.artist?.trim() || "RADIO APEX").toLocaleUpperCase('en-US')} · ${(nowPlaying.title?.trim() || "").toLocaleUpperCase('en-US')}`;

  // Optimize: Create content once and reuse
  const marqueeContent = (
    <>
      <span className="text-[#FD1D35]">*NOW PLAYING: </span>
      <span className="text-white">{displayText}</span>
      <span className="inline-block w-8" />
      <span className="text-white">*WELCOME TO RADIO APEX. 100% DANCE MUSIC STATION*</span>
      <span className="inline-block w-8" />
    </>
  );

  return (
    <footer className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-4 right-4 z-50 mx-auto flex h-[48px] sm:h-[45px] md:h-[50px] max-w-[1399px] justify-center">
      <div className="relative w-full rounded-[50px] border border-[rgba(154,154,154,0.2)] bg-black/30 overflow-hidden">
        {/* Optimized scrolling text container with CSS mask */}
        <div 
          className="flex h-full items-center whitespace-nowrap font-spaceGrotesk text-[10px] sm:text-[11px] md:text-xs font-normal uppercase tracking-[0.05em] leading-[15px]"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)'
          }}
        >
          <div className="animate-marquee inline-block">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="inline-block">
                {marqueeContent}
              </span>
            ))}
          </div>
          <div className="animate-marquee inline-block" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="inline-block">
                {marqueeContent}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
