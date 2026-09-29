"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ChevronRight, Heart, Music2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SongHistoryItem } from "@/components/now-playing/NowPlayingProvider";

const STORAGE_KEY = "radioapex-liked-tracks";
const LIKED_TRACKS_EVENT = "radioapex-liked-tracks-updated";

type LikedTrack = SongHistoryItem & { id: string; likedAt: string };

function createTrackId(title: string, artist: string) {
  return `${artist}::${title}`.trim().toLocaleLowerCase("tr-TR");
}

function readLikedTracks(): LikedTrack[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed as LikedTrack[] : [];
  } catch {
    return [];
  }
}

function saveLikedTracks(tracks: LikedTrack[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  window.dispatchEvent(new Event(LIKED_TRACKS_EVENT));
}

export default function RecentlyPlayed({ tracks }: { tracks: SongHistoryItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const recentTracks = useMemo(() => tracks.slice(0, 5), [tracks]);

  useEffect(() => {
    const refresh = () => setLikedTracks(readLikedTracks());
    refresh();
    window.addEventListener(LIKED_TRACKS_EVENT, refresh);
    return () => window.removeEventListener(LIKED_TRACKS_EVENT, refresh);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const toggleLikedTrack = (track: SongHistoryItem) => {
    const id = createTrackId(track.title, track.artist);
    const exists = likedTracks.some((item) => item.id === id);
    const nextTracks = exists
      ? likedTracks.filter((item) => item.id !== id)
      : [{ ...track, id, likedAt: new Date().toISOString() }, ...likedTracks];
    setLikedTracks(nextTracks);
    saveLikedTracks(nextTracks);
  };

  const TrackRow = ({ track }: { track: SongHistoryItem }) => {
    const id = createTrackId(track.title, track.artist);
    const isLiked = likedTracks.some((item) => item.id === id);
    return (
      <li className="flex items-center gap-3 border-b border-white/[0.035] py-3 last:border-0">
        <Music2 className="h-4 w-4 shrink-0 text-[#FD1D35]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium tracking-wide text-white">{track.title}</p>
          <p className="truncate text-xs tracking-wide text-white/55">{track.artist || "RADIO APEX"}</p>
        </div>
        <button
          type="button"
          onClick={() => toggleLikedTrack(track)}
          aria-label={isLiked ? `Remove ${track.title} from liked tracks` : `Like ${track.title}`}
          aria-pressed={isLiked}
          className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-[#FD1D35] text-[#FD1D35]" : ""}`} />
        </button>
      </li>
    );
  };

  return (
    <div
      className="pointer-events-auto absolute left-1/2 z-30 w-[min(92vw,360px)] -translate-x-1/2"
      style={{
        top: "calc(50% + (var(--player-stage-size, 300px) * 0.5) + var(--recently-played-gap, clamp(68px, 11vh, 96px)) - 40px)"
      }}
    >
      <button
        type="button"
        onClick={() => recentTracks.length > 0 && setIsOpen(true)}
        disabled={recentTracks.length === 0}
        aria-label="Open recently played tracks"
        className="flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-transparent px-4 py-3 text-left transition hover:border-[#FD1D35]/60 disabled:cursor-default"
      >
        <Music2 className="h-4 w-4 shrink-0 text-[#FD1D35]" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">Recently Played</p>
          <p className="truncate text-sm font-medium tracking-wide text-white">
            {recentTracks[0]
              ? `${recentTracks[0].title} – ${recentTracks[0].artist || "RADIO APEX"}`
              : "No recent tracks yet"}
          </p>
        </div>
        {recentTracks.length > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-white/55" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.22 }}
            className="absolute bottom-0 w-full overflow-hidden rounded-2xl border border-white/15 bg-[#111217]/[.98] p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white">Recently played</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/45">Last 5 tracks</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close recently played tracks" className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul>{recentTracks.map((track) => <TrackRow key={createTrackId(track.title, track.artist)} track={track} />)}</ul>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
