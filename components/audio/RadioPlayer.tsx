"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNowPlaying } from "@/components/now-playing/NowPlayingProvider";

const STREAM_URL =
  process.env.NEXT_PUBLIC_STREAM_URL ??
  "https://radio.cast.click/radio/8000/radio.mp3";

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { nowPlaying, isLoading } = useNowPlaying();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(STREAM_URL);
      audioRef.current.preload = "none";
      audioRef.current.crossOrigin = "anonymous";
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlayback = async () => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setHasError(false);
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Failed to play stream", error);
      setHasError(true);
      setIsPlaying(false);
    }
  };

  const displayTitle = useMemo(() => {
    if (hasError) {
      return "Bağlantı sorunu";
    }
    if (isLoading) {
      return "Yayın hazırlanıyor";
    }
    return nowPlaying.title?.trim() || "Radio Apex Live";
  }, [hasError, isLoading, nowPlaying.title]);

  const displayArtist = useMemo(() => {
    if (hasError) {
      return "Lütfen daha sonra tekrar deneyin";
    }
    if (isLoading) {
      return "Radio Apex";
    }
    return nowPlaying.artist?.trim() || "Radio Apex";
  }, [hasError, isLoading, nowPlaying.artist]);

  const statusLabel = useMemo(() => {
    if (hasError) {
      return "CONNECTION ERROR";
    }
    if (isPlaying) {
      return "NOW PLAYING";
    }
    return isLoading ? "LOADING STREAM" : "LIVE STREAM";
  }, [hasError, isLoading, isPlaying]);

  return (
    <div className="relative flex w-full flex-col items-center gap-6 text-center">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={togglePlayback}
        aria-label={isPlaying ? "Yayını durdur" : "Yayını başlat"}
        className="group relative flex items-center justify-center"
        style={{
          width: "min(60vw, 280px)",
          height: "min(60vw, 280px)"
        }}
      >
        {/* Figma tasarımındaki gibi kırmızı daire ve beyaz üçgen */}
        <span className="absolute inset-0 rounded-full bg-[#f04868] shadow-[0_0_40px_rgba(240,72,104,0.4)]" />
        <span className="absolute inset-[8%] rounded-full bg-white" />
        
        {/* Merkezi play/pause butonu */}
        <motion.span
          key={isPlaying ? "pause" : "play"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#f04868] shadow-lg"
        >
          {isPlaying ? (
            <span className="flex gap-2">
              <span className="block h-8 w-2 rounded-full bg-[#f04868]" />
              <span className="block h-8 w-2 rounded-full bg-[#f04868]" />
            </span>
          ) : (
            <svg
              className="ml-1"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.span>

        {/* Dış halka efekti */}
        <span className="absolute inset-[-8%] rounded-full border-2 border-[#f04868]/30 animate-pulse" />
      </motion.button>

      {/* Şarkı bilgileri - Figma tasarımındaki gibi */}
      <div className="flex flex-col items-center gap-3">
        <motion.h3
          key={displayTitle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className="text-xl font-bold uppercase tracking-[0.1em] text-[#f04868] sm:text-2xl"
        >
          {displayTitle}
        </motion.h3>

        <motion.p
          key={displayArtist}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="text-sm uppercase tracking-[0.2em] text-white/90 font-medium"
        >
          {displayArtist}
        </motion.p>
      </div>
    </div>
  );
}
