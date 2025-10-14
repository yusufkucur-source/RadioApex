"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useNowPlaying } from "@/components/now-playing/NowPlayingProvider";

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

export default function SimplePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { nowPlaying } = useNowPlaying();

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio play error:", error);
      setIsPlaying(false);
    }
  };

  // Audio element event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center pb-20">
      {/* Outer Gradient Circle - Ellipse 5773 */}
      <div
        className="absolute scale-100 sm:scale-110 md:scale-125"
        style={{
          width: "450px",
          height: "450px",
          background: "linear-gradient(180deg, rgba(37, 120, 130, 0.27) 0%, rgba(253, 29, 53, 0.4) 100%)",
          borderRadius: "50%",
          opacity: 0.8
        }}
      />

      {/* Middle Border Circle - Ellipse 5774 */}
      <motion.div
        className="absolute scale-75 sm:scale-90 md:scale-100"
        style={{
          width: "248px",
          height: "248px",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "50%"
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      />

      {/* Play Button / Soundwave Visualizer */}
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.button
            key="play-button"
            onClick={handlePlayPause}
            className="relative z-10 cursor-pointer"
            style={{
              width: "211px",
              height: "211px"
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.5, type: "spring" }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/images/home/Play_circle.svg"
              alt="Play"
              width={211}
              height={211}
              className="w-full h-full"
              priority
            />
            
            {/* Icon Border - kırmızı border */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: "4px solid #FD1D35",
                left: "8.33%",
                right: "8.33%",
                top: "8.33%",
                bottom: "8.33%"
              }}
            />
          </motion.button>
        ) : (
          <motion.div
            key="soundwave"
            className="relative z-10 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              width: "211px",
              height: "211px"
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            onClick={handlePlayPause}
          >
            {soundwaveBars.map((bar, index) => (
              <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Song Title - THE MESSAGE (Play butonunun hemen altında) */}
      <motion.div
        className="absolute z-20 font-spaceGrotesk text-lg sm:text-xl md:text-[22px] font-medium uppercase tracking-[0.05em] text-[#FD1D35] text-center whitespace-nowrap"
        style={{
          top: "calc(50% + 105px)"
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {nowPlaying.title}
      </motion.div>

      {/* Artist Name - JOB DE JONG (Şarkı isminin altında) */}
      <motion.div
        className="absolute z-20 font-spaceGrotesk text-xs font-medium uppercase tracking-[0.05em] text-white text-center whitespace-nowrap"
        style={{
          top: "calc(50% + 135px)"
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {nowPlaying.artist}
      </motion.div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={STREAM_URL}
        preload="none"
        className="hidden"
      />
    </div>
  );
}

