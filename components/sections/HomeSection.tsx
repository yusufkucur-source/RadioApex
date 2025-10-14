"use client";

import { motion } from "framer-motion";
import SimplePlayer from "@/components/audio/SimplePlayer";
import TurntableVisualizer from "@/components/graphics/TurntableVisualizer";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Music } from "lucide-react";

const socials = [
  { 
    label: "Instagram", 
    href: "https://instagram.com/radioapex",
    icon: Instagram
  },
  { 
    label: "Twitter", 
    href: "https://twitter.com/radioapex",
    icon: Twitter
  },
  { 
    label: "SoundCloud", 
    href: "https://soundcloud.com/radioapex",
    icon: Music
  }
];

export default function HomeSection() {
  return (
    <section
      id="home"
      className="scroll-snap-start relative flex min-h-screen items-center overflow-hidden text-white"
    >
      {/* Background Lines - Full screen, sabit aralıklarla grid çizgileri */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        {Array.from({ length: 24 }).map((_, index) => (
          <div
            key={index}
            className="absolute top-0 h-screen w-px"
            style={{
              left: `${(index + 1) * 300}px`,
              background: "rgba(255, 255, 255, 0.03)"
            }}
          />
        ))}
      </div>

      {/* Arka plan katmanları */}
      <div className="hero-bg-outer pointer-events-none absolute inset-0 -z-20" />
      <div className="hero-bg-gradient pointer-events-none absolute inset-0 -z-20" />
      <div className="hero-bg-lines pointer-events-none absolute inset-0 -z-10" />
      
      {/* TAM EKRAN BACKGROUND IMAGE - Figma tasarımındaki gibi */}
      <div 
        className="pointer-events-none absolute inset-0 -z-5 bg-cover bg-center bg-no-repeat opacity-100"
        style={{
          backgroundImage: "url('/images/home/index_background_v2.png')",
          filter: "brightness(0.7) contrast(1.1)"
        }}
      />
      
      {/* TAM EKRAN TURNTABLE SVG - Figma tasarımındaki gibi */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <TurntableVisualizer isFullScreen>
          <div /> {/* Boş div - play butonu üstte olacak */}
        </TurntableVisualizer>
      </div>

      {/* İçerik katmanı - Sol tarafta + Merkezi play butonu */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1399px] flex-col items-center justify-center gap-12 px-4 sm:px-6 md:px-8 lg:flex-row lg:justify-between lg:gap-0">
        {/* Sol taraf - İçerik */}
        <div className="w-full max-w-xl space-y-8 text-center lg:w-auto lg:text-left">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.45em] text-white/60"
          >
            <span className="h-1 w-1 rounded-full bg-[#FD1D35]" />
            LIVE RADIO
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.8, ease: "easeOut" }}
            className="text-balance text-4xl font-bold uppercase leading-tight tracking-[0.08em] text-[#FD1D35] sm:text-5xl md:text-6xl lg:text-[72px]"
          >
            Feel Good Sound.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.8, ease: "easeOut" }}
            className="text-base leading-relaxed text-white sm:text-lg"
          >
            Radio Apex is an experimental space broadcasting electronic,
            ambient, avant-garde, and boundary-pushing sounds 24/7. Sit back and
            drift away — or turn up the volume and dive in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <Button
                  key={social.label}
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-11 w-11 rounded-full border border-white/10 bg-white/5 text-white/60 backdrop-blur-sm transition-all hover:border-[#FD1D35]/50 hover:bg-[#FD1D35]/10 hover:text-[#FD1D35] hover:scale-110"
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </Button>
              );
            })}
          </motion.div>
        </div>

        {/* Sağ taraf - Merkezi Radio Player (üst katmanda) */}
        <div className="flex w-full items-center justify-center lg:flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md lg:max-w-none"
          >
            <SimplePlayer />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
