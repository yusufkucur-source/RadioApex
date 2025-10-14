"use client";

import Header from "@/components/navigation/Header";
import Footer from "@/components/layout/Footer";
import SimplePlayer from "@/components/audio/SimplePlayer";
import { NowPlayingProvider } from "@/components/now-playing/NowPlayingProvider";
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

export default function Page() {
  return (
    <NowPlayingProvider>
      <Header />
      <main className="relative w-full overflow-hidden bg-apex-background">
        <section
          id="home"
          className="scroll-snap-start relative flex min-h-screen items-center justify-center overflow-hidden text-white"
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
          
          {/* FULL SCREEN TURNTABLE SVG */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <img 
              src="/images/home/SVG/Turntable_V08_animated_CSS_ids_fixed_dots36s_v2.svg" 
              alt="Turntable"
              className="w-full h-full"
              style={{ objectFit: "cover", objectPosition: "center", opacity: 0.2 }}
            />
          </div>
          
          {/* FEEL GOOD SOUND. - Başlık */}
          <div 
            className="absolute z-10 left-1/2 -translate-x-1/2 whitespace-nowrap font-roboto text-[32px] sm:text-[42px] md:text-[57px]"
            style={{
              top: "calc(50% - 359.5px)",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "1.12",
              letterSpacing: "-0.25px",
              color: "#FD1D35"
            }}
          >
            FEEL GOOD SOUND.
          </div>

          {/* Açıklama Metni */}
          <div 
            className="absolute z-10 left-1/2 -translate-x-1/2 font-spaceGrotesk text-sm sm:text-base px-4 max-w-[791px]"
            style={{
              top: "calc(50% - 280px)",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "1.25",
              textAlign: "center",
              color: "#FFFFFF"
            }}
          >
            Radio Apex is an experimental space broadcasting electronic, ambient, avant-garde, and boundary-pushing sounds 24/7. Sit back and drift away — or turn up the volume and dive in.
          </div>

          {/* Simple Player - Play butonu background center'a tam hizalı */}
          <div className="relative z-10 flex h-full w-full items-center justify-center">
            <div className="translate-y-10">
              <SimplePlayer />
            </div>
          </div>

          {/* Sosyal Medya İkonları - Footer üstünde */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center gap-4">
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
          </div>
        </section>
        <Footer />
      </main>
    </NowPlayingProvider>
  );
}
