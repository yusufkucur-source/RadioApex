"use client";

import { useMemo } from "react";
import { useNowPlaying } from "@/components/now-playing/NowPlayingProvider";

export default function NowPlayingTicker() {
  const { nowPlaying, isLoading } = useNowPlaying();

  const text = useMemo(() => {
    if (isLoading) {
      return "*NOW PLAYING: RADIO APEX - YAYIN YUKLENIYOR";
    }
    const artist = nowPlaying.artist?.trim() || "RADIO APEX";
    const title = nowPlaying.title?.trim() || "LIVE STREAM";
    return `*NOW PLAYING: ${artist.toUpperCase()} - ${title.toUpperCase()}`;
  }, [isLoading, nowPlaying]);

  return (
    <div className="relative overflow-hidden bg-black/20 border-t border-white/10">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-apex-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-apex-background to-transparent" />
      <div className="flex whitespace-nowrap text-sm uppercase tracking-[0.3em] text-white font-medium">
        <span className="animate-marquee flex min-w-full items-center gap-20">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="flex items-center gap-4">
              <span className="text-[#f04868]">*NOW PLAYING:</span>
              <span className="text-white">
                {isLoading ? "RADIO APEX - YAYIN YUKLENIYOR" : 
                 `${(nowPlaying.artist?.trim() || "RADIO APEX").toUpperCase()} - ${(nowPlaying.title?.trim() || "LIVE STREAM").toUpperCase()}`}
              </span>
            </span>
          ))}
        </span>
        <span
          aria-hidden="true"
          className="animate-marquee flex min-w-full items-center gap-20"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="flex items-center gap-4">
              <span className="text-[#f04868]">*NOW PLAYING:</span>
              <span className="text-white">
                {isLoading ? "RADIO APEX - YAYIN YUKLENIYOR" : 
                 `${(nowPlaying.artist?.trim() || "RADIO APEX").toUpperCase()} - ${(nowPlaying.title?.trim() || "LIVE STREAM").toUpperCase()}`}
              </span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
