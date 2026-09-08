"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useNowPlaying } from "@/components/now-playing/NowPlayingProvider";
import { trackAnalyticsEvent } from "@/lib/analytics";

const STREAM_URL = "https://radio.cast.click/radio/8000/radio.mp3";

// Soundwave bars configuration
const soundwaveBars = [
  { delay: 0, duration: 0.8 },
  { delay: 0.1, duration: 0.6 },
  { delay: 0.2, duration: 0.9 },
  { delay: 0.3, duration: 0.7 },
  { delay: 0.4, duration: 0.85 },
  { delay: 0.15, duration: 0.75 },
  { delay: 0.25, duration: 0.65 },
];

export default function CenteredPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { nowPlaying } = useNowPlaying();

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        trackAnalyticsEvent("stream_stop", { source: "website" });
      } else {
        // `play()` loads the stream when needed. Calling `load()` first would
        // open the live stream on page mount and restart it on every play.
        await audio.play();
        setIsPlaying(true);
        trackAnalyticsEvent("stream_start", { source: "website" });
      }
    } catch (error) {
      console.error("Audio play error:", error);
      setIsPlaying(false);
    }
  };

  // Audio element initialization and event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
    };
    const handleError = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  return (
    <div
      className="centered-player-container"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        pointerEvents: "none"
      }}
    >
      {/* Rotating Circle - Background */}
      <div
        className="rotating-circle"
        style={{
          width: "300px",
          height: "300px",
          border: "2px solid #FD1D35",
          borderRadius: "50%",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          opacity: 0.2
        }}
      />

      {/* Play Button / Soundwave Visualizer */}
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <m.button
            key="play-button"
            onClick={handlePlayPause}
            className="play-button"
            style={{
              width: "200px",
              height: "200px",
              filter: "drop-shadow(0 0 30px rgba(253, 29, 53, 0.6)) drop-shadow(0 0 60px rgba(253, 29, 53, 0.4))",
              position: "relative",
              zIndex: 10,
              pointerEvents: "auto"
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.5, type: "spring" }}
            whileHover={{ 
              scale: 1.08,
              filter: "drop-shadow(0 0 40px rgba(253, 29, 53, 0.8)) drop-shadow(0 0 80px rgba(253, 29, 53, 0.5))"
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Glow Background Layer */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
              style={{
                background: "radial-gradient(circle, rgba(253, 29, 53, 0.3) 0%, rgba(253, 29, 53, 0) 70%)",
                filter: "blur(20px)",
                transform: "scale(1.2)"
              }}
            />
            
            <Image
              src="/images/home/Play_circle.svg"
              alt="Play"
              width={200}
              height={200}
              className="w-full h-full relative z-10"
              priority
            />
            
            {/* Icon Border - kırmızı border with glow */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: "4px solid #FD1D35",
                left: "8.33%",
                right: "8.33%",
                top: "8.33%",
                bottom: "8.33%",
                boxShadow: "0 0 20px rgba(253, 29, 53, 0.8), inset 0 0 20px rgba(253, 29, 53, 0.3)"
              }}
            />
            
            {/* Pulse Effect */}
            <span 
              className="absolute rounded-full pointer-events-none border-4 border-[#FD1D35] animate-pulse-ring"
              style={{
                left: "8.33%",
                right: "8.33%",
                top: "8.33%",
                bottom: "8.33%"
              }}
            />
          </m.button>
        ) : (
          <m.div
            key="soundwave"
            className="relative z-10 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              width: "200px",
              height: "200px",
              position: "relative",
              zIndex: 10,
              pointerEvents: "auto"
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            onClick={handlePlayPause}
          >
            {soundwaveBars.map((bar, index) => (
              <m.div
                key={index}
                className="w-2 bg-gradient-to-b from-[#FD1D35] to-[#FF6B6B] rounded-full"
                initial={{ height: "20%" }}
                animate={{
                  height: ["20%", "100%", "20%"],
                }}
                transition={{
                  duration: bar.duration,
                  repeat: Infinity,
                  delay: bar.delay,
                  ease: "easeInOut",
                }}
                style={{
                  maxHeight: "120px"
                }}
              />
            ))}
          </m.div>
        )}
      </AnimatePresence>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        crossOrigin="anonymous"
        className="hidden"
      />

      <style jsx>{`
        .play-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          pointer-events: auto;
        }
        
        
        .rotating-circle {
          pointer-events: none;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .play-button {
            width: 150px !important;
            height: 150px !important;
          }
        }
        
        @media (max-width: 480px) {
          .play-button {
            width: 120px !important;
            height: 120px !important;
          }
        }
      `}</style>
    </div>
  );
}
