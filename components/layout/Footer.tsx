"use client";

import { m } from "framer-motion";
import { useNowPlaying } from "@/components/now-playing/NowPlayingProvider";

export default function Footer() {
  const { nowPlaying, isLoading } = useNowPlaying();

  const displayText = isLoading
    ? "RADIO APEX - YAYIN YUKLENIYOR"
    : `${(nowPlaying.artist?.trim() || "RADIO APEX").toLocaleUpperCase('en-US')} · ${(nowPlaying.title?.trim() || "LIVE STREAM").toLocaleUpperCase('en-US')}`;

  return (
    <m.footer 
      className="fixed bottom-4 sm:bottom-6 md:bottom-8 left-4 right-4 z-50 mx-auto flex h-[32px] sm:h-[35px] md:h-[37px] max-w-[1399px] justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
    >
      <div className="relative w-full rounded-[50px] border border-[rgba(154,154,154,0.2)] bg-black/20 backdrop-blur-3xl overflow-hidden">
        {/* Scrolling text container with feathered edges */}
        <div 
          className="flex h-full items-center whitespace-nowrap font-spaceGrotesk text-[10px] sm:text-[11px] md:text-xs font-normal uppercase tracking-[0.05em] leading-[15px]"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
          }}
        >
          <div className="animate-marquee inline-block">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="inline-block">
                <span className="text-[#FD1D35]">*NOW PLAYING: </span>
                <span className="text-white">{displayText}</span>
                <span className="inline-block w-8" />
                <span className="text-[#FD1D35]">*WELCOME TO RADIO APEX. 100% DANCE MUSIC STATION*</span>
                <span className="inline-block w-8" />
              </span>
            ))}
          </div>
          <div className="animate-marquee inline-block" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="inline-block">
                <span className="text-[#FD1D35]">*NOW PLAYING: </span>
                <span className="text-white">{displayText}</span>
                <span className="inline-block w-8" />
                <span className="text-[#FD1D35]">*WELCOME TO RADIO APEX. 100% DANCE MUSIC STATION*</span>
                <span className="inline-block w-8" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </m.footer>
  );
}
