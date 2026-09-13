"use client";

import { useState, useRef, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EqualizerVisualizer from "./EqualizerVisualizer";
import { trackAnalyticsEvent } from "@/lib/analytics";

export type AudioQuality = "128" | "320";

const STREAM_URLS: Record<AudioQuality, string> = {
  // 128 kbps Standart Kalite (MP3)
  "128": "https://radio.cast.click/radio/8000/radio.mp3",
  // 320 kbps Stüdyo / Yüksek Kalite (AAC/HQ - Varsayılan)
  "320": "https://radio.cast.click/radio/8000/radioapex.flac",
};

export default function CenteredPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  // Varsayılan kalite: 320 kbps
  const [quality, setQuality] = useState<AudioQuality>("320");
  const [hoveredQuality, setHoveredQuality] = useState<AudioQuality | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        setIsBuffering(false);
        trackAnalyticsEvent("stream_stop", { source: "website", quality });
      } else {
        setIsBuffering(true);
        const targetUrl = STREAM_URLS[quality];
        if (audio.src !== targetUrl) {
          audio.src = targetUrl;
        }
        await audio.play();
        setIsPlaying(true);
        setIsBuffering(false);
        trackAnalyticsEvent("stream_start", { source: "website", quality });
      }
    } catch (error) {
      console.error("Audio play error:", error);
      setIsPlaying(false);
      setIsBuffering(false);
    }
  };

  // Kalite Değiştirme (128 KBPS <-> 320 KBPS HQ)
  const handleQualityChange = async (newQuality: AudioQuality) => {
    if (newQuality === quality) return;

    setQuality(newQuality);
    trackAnalyticsEvent("quality_change", { quality: newQuality });

    const audio = audioRef.current;
    if (!audio) return;

    // Eğer o anda çalıyorsa, yayını kesintisiz olarak yeni kaliteye aktar
    if (isPlaying) {
      setIsBuffering(true);
      const targetUrl = STREAM_URLS[newQuality];
      audio.pause();
      audio.src = targetUrl;
      try {
        await audio.play();
        setIsPlaying(true);
        setIsBuffering(false);
      } catch (err) {
        console.error("Kalite geçiş hatası:", err);
        setIsPlaying(false);
        setIsBuffering(false);
      }
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
            <m.button
              key="play-button"
              onClick={handlePlayPause}
              className="play-button absolute inset-0 m-auto"
              style={{
                width: "250px",
                height: "250px",
                filter:
                  "drop-shadow(0 0 35px rgba(253, 29, 53, 0.65)) drop-shadow(0 0 70px rgba(253, 29, 53, 0.45))",
                position: "relative",
                zIndex: 10,
                pointerEvents: "auto",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              whileHover={{
                scale: 1.05,
                filter:
                  "drop-shadow(0 0 45px rgba(253, 29, 53, 0.85)) drop-shadow(0 0 90px rgba(253, 29, 53, 0.55))",
              }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Yayını Başlat (${quality} kbps)`}
            >
              {/* Glow Background Layer */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                style={{
                  background:
                    "radial-gradient(circle, rgba(253, 29, 53, 0.3) 0%, rgba(253, 29, 53, 0) 70%)",
                  filter: "blur(20px)",
                  transform: "scale(1.2)",
                }}
              />

              <Image
                src="/images/home/Play_circle.svg"
                alt="Play"
                width={250}
                height={250}
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
                  boxShadow:
                    "0 0 20px rgba(253, 29, 53, 0.8), inset 0 0 20px rgba(253, 29, 53, 0.3)",
                }}
              />

              {/* Pulse Effect */}
              <span
                className="absolute rounded-full pointer-events-none border-4 border-[#FD1D35] animate-pulse-ring"
                style={{
                  left: "8.33%",
                  right: "8.33%",
                  top: "8.33%",
                  bottom: "8.33%",
                }}
              />

              {/* Buffering Indicator */}
              {isBuffering && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-[#FD1D35] rounded-full animate-spin mb-2" />
                  <span className="font-antonio text-[10px] tracking-widest text-white uppercase">
                    CONNECTING...
                  </span>
                </div>
              )}
            </m.button>
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
                size={300}
              />
            </m.div>
          )}
        </AnimatePresence>

        {/* 
          2. KALİTE SEÇİCİ SWITCH (Tam Merkezin Altında - Absolute Anchored)
          Player sahnesinin altına 'absolute' bağlandığı için player'ın ekran merkezindeki
          konumunu milimetrik olarak bile DEĞİŞTİRMEZ.
        */}
        <div className="absolute top-[calc(100%+22px)] sm:top-[calc(100%+26px)] left-1/2 -translate-x-1/2 pointer-events-auto">
          <div
            onMouseLeave={() => setHoveredQuality(null)}
            className="relative flex items-center rounded-full bg-black/30 border border-white/10 p-1 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
          >
            {/* 128 KBPS Sekmesi */}
            <m.button
              type="button"
              onClick={() => handleQualityChange("128")}
              onMouseEnter={() => setHoveredQuality("128")}
              whileTap={{ scale: 0.96 }}
              className={`relative z-10 flex items-center justify-center w-[105px] sm:w-[115px] h-[34px] rounded-full text-[11px] sm:text-[12px] font-antonio tracking-widest uppercase transition-colors duration-200 select-none ${
                quality === "128"
                  ? "text-white font-bold"
                  : "text-white/45 hover:text-white/80"
              }`}
              aria-label="128 kbps Standart Ses Kalitesi"
            >
              {/* Kayarak gelen hover arka planı */}
              {hoveredQuality === "128" && quality !== "128" && (
                <m.div
                  layoutId="hover-quality-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.06]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                  }}
                />
              )}

              {/* Aktif Kayar Kapsül (Active Spring Pill) */}
              {quality === "128" && (
                <m.div
                  layoutId="active-quality-switch"
                  className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-[0_0_8px_rgba(255,255,255,0.08)]"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.7,
                  }}
                />
              )}
              <span className="relative z-20">128 KBPS</span>
            </m.button>

            {/* 320 KBPS HQ Sekmesi (Varsayılan) */}
            <m.button
              type="button"
              onClick={() => handleQualityChange("320")}
              onMouseEnter={() => setHoveredQuality("320")}
              whileTap={{ scale: 0.96 }}
              className={`relative z-10 flex items-center justify-center gap-1.5 w-[105px] sm:w-[115px] h-[34px] rounded-full text-[11px] sm:text-[12px] font-antonio tracking-widest uppercase transition-colors duration-200 select-none ${
                quality === "320"
                  ? "text-white font-bold"
                  : "text-white/45 hover:text-white/80"
              }`}
              aria-label="320 kbps Stüdyo HQ Ses Kalitesi"
            >
              {/* Kayarak gelen hover arka planı */}
              {hoveredQuality === "320" && quality !== "320" && (
                <m.div
                  layoutId="hover-quality-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.06]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                  }}
                />
              )}

              {/* Aktif Kayar Kapsül (Active Spring Pill) */}
              {quality === "320" && (
                <m.div
                  layoutId="active-quality-switch"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FD1D35] to-[#FF2D47] shadow-[0_0_10px_rgba(253,29,53,0.45),inset_0_1px_1px_rgba(255,255,255,0.25)]"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.7,
                  }}
                />
              )}
              <span className="relative z-20 flex items-center gap-1.5">
                <span>320 KBPS</span>
                <span
                  className={`text-[8px] font-extrabold px-1.5 py-[2px] rounded-sm leading-none transition-colors ${
                    quality === "320"
                      ? "bg-white text-[#FD1D35] shadow-[0_0_6px_rgba(255,255,255,0.8)]"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  HQ
                </span>
              </span>
            </m.button>

          </div>
        </div>

      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={STREAM_URLS[quality]}
        preload="none"
        className="hidden"
      />

      <style jsx>{`
        .player-stage {
          width: 300px;
          height: 300px;
        }

        .play-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .player-stage {
            width: 240px;
            height: 240px;
          }
          .play-button {
            width: 190px !important;
            height: 190px !important;
          }
        }

        @media (max-width: 480px) {
          .player-stage {
            width: 200px;
            height: 200px;
          }
          .play-button {
            width: 150px !important;
            height: 150px !important;
          }
        }
      `}</style>
    </div>
  );
}
