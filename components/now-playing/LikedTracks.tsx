"use client";

import { Heart, Music, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";

const STORAGE_KEY = "radioapex-liked-tracks";

type Track = {
  id: string;
  title: string;
  artist: string;
  likedAt: string;
};

function createTrackId(title: string, artist: string) {
  return `${artist}::${title}`.trim().toLocaleLowerCase("tr-TR");
}

function readLikedTracks(): Track[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter(
          (track): track is Track =>
            Boolean(
              track &&
                typeof track === "object" &&
                "id" in track &&
                "title" in track &&
                "artist" in track &&
                "likedAt" in track
            )
        )
      : [];
  } catch {
    return [];
  }
}

function saveLikedTracks(tracks: Track[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
}

export default function LikedTracks({ title, artist }: Pick<Track, "title" | "artist">) {
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [burstId, setBurstId] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const currentTrackId = useMemo(() => createTrackId(title, artist), [title, artist]);
  const isLiked = likedTracks.some((track) => track.id === currentTrackId);

  useEffect(() => {
    setLikedTracks(readLikedTracks());
    setIsReady(true);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const updateTracks = (nextTracks: Track[]) => {
    setLikedTracks(nextTracks);
    saveLikedTracks(nextTracks);
  };

  const toggleCurrentTrack = () => {
    if (!isReady || !title.trim()) return;

    if (isLiked) {
      updateTracks(likedTracks.filter((track) => track.id !== currentTrackId));
      return;
    }

    updateTracks([
      { id: currentTrackId, title: title.trim(), artist: artist.trim(), likedAt: new Date().toISOString() },
      ...likedTracks,
    ]);
    setBurstId((value) => value + 1);
  };

  const removeTrack = (id: string) => {
    updateTracks(likedTracks.filter((track) => track.id !== id));
  };

  return (
    <div className="relative z-40 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={toggleCurrentTrack}
          disabled={!isReady || !title.trim()}
          aria-label={isLiked ? "Remove from liked tracks" : "Like this track"}
          aria-pressed={isLiked}
          className="inline-flex h-[34px] w-[104px] items-center justify-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm transition hover:border-[#FD1D35]/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:w-[122px] sm:gap-2 sm:px-4 sm:text-[11px] sm:tracking-[0.16em]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={isLiked ? "liked" : "like"}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.55, rotate: -18, filter: "blur(2px)" }}
              animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.55, rotate: 18, filter: "blur(2px)" }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2"
            >
              <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isLiked ? "fill-[#FD1D35] text-[#FD1D35]" : "text-white"}`} />
              {isLiked ? "Liked" : "Like"}
            </m.span>
          </AnimatePresence>
        </button>
        {!shouldReduceMotion && burstId > 0 && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-0">
            {Array.from({ length: 6 }).map((_, index) => {
              const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
              return (
                <m.span
                  key={`${burstId}-${index}`}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 0.55 }}
                  animate={{
                    opacity: 0,
                    x: Math.cos(angle) * 28,
                    y: Math.sin(angle) * 28,
                    scale: 0,
                  }}
                  transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#FD1D35]"
                />
              );
            })}
          </span>
        )}
      </div>
      <AnimatePresence initial={false}>
      {likedTracks.length > 0 && (
        <m.button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.65, y: 8, rotate: -12, filter: "blur(2px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, rotate: 0, filter: "blur(0px)" }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 4, filter: "blur(2px)" }}
          transition={{ type: "spring", stiffness: 460, damping: 24, mass: 0.65 }}
          className="relative inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/80 backdrop-blur-sm transition hover:border-[#FD1D35]/70 hover:text-white sm:h-10 sm:w-10"
          aria-label={`Open ${likedTracks.length} liked tracks`}
          aria-expanded={isOpen}
          title="Liked tracks"
        >
          <Music className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FD1D35] px-1 text-[9px] font-bold text-white">
            {likedTracks.length}
          </span>
        </m.button>
      )}
      </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
        <m.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: -8, scale: 0.96, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -5, scale: 0.98, filter: "blur(3px)" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-full mt-2 w-[min(90vw,360px)] origin-top overflow-hidden rounded-2xl border border-white/10 bg-[#111217]/95 text-left shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">Liked tracks</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white"
              aria-label="Close liked tracks"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {likedTracks.length === 0 ? (
            <p className="px-4 py-5 text-sm text-white/55">No liked tracks yet.</p>
          ) : (
            <ul className="max-h-60 overflow-y-auto">
              {likedTracks.map((track) => (
                <li key={track.id} className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0">
                  <Heart className="h-4 w-4 shrink-0 fill-[#FD1D35] text-[#FD1D35]" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{track.title}</p>
                    <p className="truncate text-xs text-white/55">{track.artist}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTrack(track.id)}
                    className="rounded-full p-1.5 text-white/45 transition hover:bg-white/10 hover:text-white"
                    aria-label={`Remove ${track.title} from liked tracks`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
