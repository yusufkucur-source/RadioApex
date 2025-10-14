"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SimplePlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Demo data - daha sonra now playing'den gelecek
  const currentTrack = {
    artist: "JOB DE JONG",
    title: "THE MESSAGE"
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Actual audio play/pause logic
  };

  return (
    <div className="relative flex items-center justify-center pb-20">
      {/* Outer Gradient Circle - Ellipse 5773 */}
      <motion.div
        className="absolute scale-100 sm:scale-110 md:scale-125"
        style={{
          width: "550px",
          height: "550px",
          background: "linear-gradient(180deg, rgba(217, 217, 217, 0) 0%, rgba(253, 29, 53, 0.4) 100%)",
          borderRadius: "50%"
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
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
          rotate: 360,
          scale: [1, 1.03, 1]
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      {/* Play Circle Button */}
      <motion.button
        onClick={handlePlayPause}
        className="relative z-10 cursor-pointer"
        style={{
          width: "211px",
          height: "211px"
        }}
        animate={{
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
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
        {currentTrack.title}
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
        {currentTrack.artist}
      </motion.div>
    </div>
  );
}

