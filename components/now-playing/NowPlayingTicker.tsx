"use client";

import { useMemo } from "react";
import { useNowPlaying } from "@/components/now-playing/NowPlayingProvider";
import { isUnknownTrackText } from "@/lib/utils";

export default function NowPlayingTicker() {
  const { nowPlaying, isLoading } = useNowPlaying();

  const displayText = useMemo(() => {
    if (isLoading) {
      return "RADIO APEX - YAYIN YUKLENIYOR";
    }
    const artist = !isUnknownTrackText(nowPlaying.artist) ? nowPlaying.artist.trim().toUpperCase() : "";
    const title = !isUnknownTrackText(nowPlaying.title) ? nowPlaying.title.trim().toUpperCase() : "";

    if (artist && title) {
      return `${artist} - ${title}`;
    }
    if (title) {
      return title;
    }
    if (artist && artist !== "RADIO APEX") {
      return artist;
    }
    return "";
  }, [isLoading, nowPlaying]);

  return (
    <div className="relative overflow-hidden bg-black/20 border-t border-white/10">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-apex-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-apex-background to-transparent" />
      <div className="flex whitespace-nowrap text-sm uppercase tracking-[0.3em] text-white font-medium">
        <span className="animate-marquee flex min-w-full items-center gap-20">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="flex items-center gap-4">
              {displayText ? (
                <>
                  <span className="text-[#f04868]">*NOW PLAYING:</span>
                  <span className="text-white">{displayText}</span>
                </>
              ) : (
                <span className="text-white">*WELCOME TO RADIO APEX*</span>
              )}
            </span>
          ))}
        </span>
        <span
          aria-hidden="true"
          className="animate-marquee flex min-w-full items-center gap-20"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="flex items-center gap-4">
              {displayText ? (
                <>
                  <span className="text-[#f04868]">*NOW PLAYING:</span>
                  <span className="text-white">{displayText}</span>
                </>
              ) : (
                <span className="text-white">*WELCOME TO RADIO APEX*</span>
              )}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
