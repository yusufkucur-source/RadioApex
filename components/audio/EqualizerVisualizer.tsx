"use client";

import React, { useState } from "react";
import { m } from "framer-motion";

interface EqualizerVisualizerProps {
  isPlaying: boolean;
  onTogglePlay?: () => void;
  size?: number;
  className?: string;
}

// 30 adet modern, ince ve sık frekans barı (Fine Bars)
const FINE_BARS = Array.from({ length: 30 }, (_, i) => {
  const distFromCenter = Math.abs(i - 14.5) / 14.5;
  const bellWeight = 1 - Math.pow(distFromCenter, 1.3) * 0.52;
  const minH = Math.max(12, Math.round(18 * bellWeight));
  const maxH = Math.min(96, Math.round((70 + (i % 5) * 6) * bellWeight));
  // İdeal canlı ve akıcı stüdyo ritmi (~1.25s - 1.73s aralığı)
  const dur = 1.25 + (i % 7) * 0.08;
  // Merkezden dışa doğru yayılan dinamik dalga fazı
  const delay = Math.abs(i - 14.5) * 0.035 + (i % 3) * 0.04;
  return { id: i, minH, maxH, dur, delay };
});

export default function EqualizerVisualizer({
  isPlaying,
  onTogglePlay,
  size = 300,
  className = "",
}: EqualizerVisualizerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={isPlaying ? "Durdur" : "Oynat"}
      onClick={onTogglePlay}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTogglePlay?.();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex items-center justify-center cursor-pointer select-none outline-none w-full h-full ${className}`}
      style={{
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    >
      {/* 1. Dış Arka Plan Parlama Efekti */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
          isPlaying ? "opacity-100" : "opacity-40"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(253, 29, 53, 0.32) 0%, rgba(253, 29, 53, 0.08) 55%, transparent 75%)",
          filter: "blur(28px)",
          transform: isPlaying ? "scale(1.4)" : "scale(1)",
        }}
      />

      {/* 2. En İç Çemberden Dışa Yayılan Tek ve Net Akustik Halka */}
      {isPlaying && (
        <m.span
          className="absolute rounded-full border border-[#FD1D35] pointer-events-none"
          style={{
            boxShadow: "0 0 12px rgba(253, 29, 53, 0.6)",
          }}
          animate={{
            inset: ["8.33%", "-12%"],
            opacity: [0.8, 0],
            borderWidth: ["2px", "0.5px"],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      )}

      {/* 3. Dış Çerçeve Çemberi (Kapsül) */}
      <div
        className="absolute inset-[8.33%] rounded-full border-2 border-[#FD1D35] pointer-events-none transition-all duration-500"
        style={{
          boxShadow: isPlaying
            ? "0 0 35px rgba(253, 29, 53, 0.6), inset 0 0 25px rgba(253, 29, 53, 0.3)"
            : "0 0 15px rgba(253, 29, 53, 0.2)",
          backgroundColor: "transparent",
        }}
      />

      {/* 4. FINE BARS (30 Adet İnce, Sık, Modern Spektrum Barı) */}
      <div
        className="relative z-10 flex items-center justify-center gap-[2px] xs:gap-[2.5px] sm:gap-[3.5px] md:gap-[4px] px-2 sm:px-4"
        style={{ width: "75%", height: "55%" }}
      >
        {FINE_BARS.map((bar) => (
          <div
            key={bar.id}
            className="flex flex-col items-center justify-center h-full flex-1 relative"
          >
            <m.div
              className="w-[1.8px] xs:w-[2.2px] sm:w-[2.8px] md:w-[3.2px] rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #FFFFFF 0%, #FF8DA1 20%, #FD1D35 65%, rgba(253, 29, 53, 0.45) 100%)",
                boxShadow: isPlaying
                  ? "0 0 3px rgba(253, 29, 53, 0.4)"
                  : "none",
              }}
              animate={
                isPlaying
                  ? {
                      height: [
                        `${bar.minH}%`,
                        `${Math.round(bar.maxH * 0.78)}%`,
                        `${bar.maxH}%`,
                        `${Math.round(bar.maxH * 0.42)}%`,
                        `${bar.minH}%`,
                      ],
                      opacity: [0.65, 0.95, 1, 0.85, 0.65],
                    }
                  : { height: "8%", opacity: 0.3 }
              }
              transition={{
                duration: bar.dur,
                repeat: Infinity,
                delay: bar.delay,
                ease: "easeInOut",
              }}
            />
          </div>
        ))}
      </div>

      {/* 5. Hover Durumunda Ortada Beliren PAUSE / PLAY Butonu */}
      <div
        className={`absolute inset-0 z-30 rounded-full flex flex-col items-center justify-center transition-all duration-300 pointer-events-none ${
          isHovered
            ? "opacity-100 bg-black/60 backdrop-blur-[2px]"
            : "opacity-0"
        }`}
      >
        <m.div
          animate={{ scale: isHovered ? 1 : 0.85 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center justify-center gap-1"
        >
          {isPlaying ? (
            <>
              {/* Duraklat İkonu */}
              <div
                className="relative flex items-center justify-center w-[40%] h-[40%] max-w-[110px] max-h-[110px]"
                style={{
                  filter:
                    "drop-shadow(0 0 20px rgba(253, 29, 53, 0.9)) drop-shadow(0 0 40px rgba(253, 29, 53, 0.5))",
                }}
              >
                <svg
                  viewBox="0 0 211 211"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M105.5 193.417C154.055 193.417 193.416 154.055 193.416 105.5C193.416 56.945 154.055 17.5834 105.5 17.5834C56.9446 17.5834 17.583 56.945 17.583 105.5C17.583 154.055 56.9446 193.417 105.5 193.417Z"
                    stroke="#FD1D35"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="86"
                    y="72"
                    width="12"
                    height="67"
                    rx="3"
                    fill="#FD1D35"
                  />
                  <rect
                    x="113"
                    y="72"
                    width="12"
                    height="67"
                    rx="3"
                    fill="#FD1D35"
                  />
                </svg>
              </div>
              <span className="font-antonio text-[10px] sm:text-[12px] tracking-[0.35em] uppercase font-bold text-white drop-shadow-[0_0_10px_#FD1D35]">
                PAUSE
              </span>
            </>
          ) : (
            <>
              {/* Oynat İkonu */}
              <div
                className="relative flex items-center justify-center w-[40%] h-[40%] max-w-[110px] max-h-[110px]"
                style={{
                  filter:
                    "drop-shadow(0 0 20px rgba(253, 29, 53, 0.9)) drop-shadow(0 0 40px rgba(253, 29, 53, 0.5))",
                }}
              >
                <svg
                  viewBox="0 0 211 211"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M105.5 193.417C154.055 193.417 193.416 154.055 193.416 105.5C193.416 56.945 154.055 17.5834 105.5 17.5834C56.9446 17.5834 17.583 56.945 17.583 105.5C17.583 154.055 56.9446 193.417 105.5 193.417Z"
                    stroke="#FD1D35"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M87.9163 70.3334L140.666 105.5L87.9163 140.667V70.3334Z"
                    stroke="#FD1D35"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-antonio text-[10px] sm:text-[12px] tracking-[0.35em] uppercase font-bold text-white drop-shadow-[0_0_10px_#FD1D35]">
                PLAY
              </span>
            </>
          )}
        </m.div>
      </div>
    </div>
  );
}
