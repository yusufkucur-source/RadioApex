"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import EqualizerVisualizer from "./EqualizerVisualizer";
import { trackAnalyticsEvent } from "@/lib/analytics";

const STREAM_URL = "https://radio.cast.click/radio/8000/radioapex.flac";

export default function CenteredPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        setIsBuffering(false);
        trackAnalyticsEvent("stream_stop", { source: "website", quality: "320" });
      } else {
        setIsBuffering(true);
        const targetUrl = STREAM_URL;
        if (audio.src !== targetUrl) {
          audio.src = targetUrl;
        }
        await audio.play();
        setIsPlaying(true);
        setIsBuffering(false);
        trackAnalyticsEvent("stream_start", { source: "website", quality: "320" });
      }
    } catch (error) {
      console.error("Audio play error:", error);
      setIsPlaying(false);
      setIsBuffering(false);
    }
  };

  // Audio element initialization and event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };
    const handleWaiting = () => {
      setIsBuffering(true);
    };
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handleError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, []);

  return (
    <div
      className="centered-player-container"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      {/* 
        1. PLAYER SAHNESİ (Tam Ekran Ortasında - Dead Center) 
        Flex container doğrudan bunu ortaladığı için ekranın tam %50-%50 merkezindedir.
      */}
      <div className="player-stage relative flex items-center justify-center">
        
        {/* Play Button & Modern Fine Bars Visualizer */}
        <AnimatePresence mode="wait">
          {!isPlaying ? (
            <m.div
              key="play-button-wrapper"
              className="absolute inset-0 m-auto flex items-center justify-center pointer-events-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={handlePlayPause}
                className="group relative flex items-center justify-center w-full h-full p-0 m-0 bg-transparent border-none cursor-pointer outline-none select-none transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{
                  filter:
                    "drop-shadow(0 0 35px rgba(253, 29, 53, 0.65)) drop-shadow(0 0 70px rgba(253, 29, 53, 0.45))",
                }}
                aria-label="Yayını Başlat"
              >
                {/* Glow Background Layer */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(253, 29, 53, 0.3) 0%, rgba(253, 29, 53, 0) 70%)",
                    filter: "blur(20px)",
                    transform: "scale(1.15)",
                  }}
                />

                {/* Vector Inline Play SVG (Orjinal Play_circle.svg ile birebir aynı oranlar) */}
                <svg
                  viewBox="0 0 211 211"
                  className="w-full h-full relative z-10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M105.5 193.417C154.055 193.417 193.416 154.055 193.416 105.5C193.416 56.945 154.055 17.5834 105.5 17.5834C56.9446 17.5834 17.583 56.945 17.583 105.5C17.583 154.055 56.9446 193.417 105.5 193.417Z"
                    stroke="#FD1D35"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:stroke-[#ff3b52] transition-colors"
                  />
                  <path
                    d="M87.9163 70.3334L140.666 105.5L87.9163 140.667V70.3334Z"
                    stroke="#FD1D35"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:stroke-[#ff3b52] transition-colors"
                  />
                </svg>

                {/* Buffering Indicator */}
                {isBuffering && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-[#FD1D35] rounded-full animate-spin mb-2" />
                    <span className="font-antonio text-[10px] tracking-widest text-white uppercase">
                      CONNECTING...
                    </span>
                  </div>
                )}
              </button>
            </m.div>
          ) : (
            <m.div
              key="equalizer-visualizer"
              className="absolute inset-0 m-auto flex items-center justify-center"
              style={{ pointerEvents: "auto" }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <EqualizerVisualizer
                isPlaying={isPlaying}
                onTogglePlay={handlePlayPause}
              />
            </m.div>
          )}
        </AnimatePresence>

      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        className="hidden"
      />

      <style jsx>{`
        .player-stage {
          width: var(--player-stage-size, 300px);
          height: var(--player-stage-size, 300px);
          max-width: 90vw;
          max-height: 90vw;
        }
      `}</style>
    </div>
  );
}
