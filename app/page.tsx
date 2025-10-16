"use client";

import { useMemo, useState, useEffect } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Header from "@/components/navigation/Header";
import Footer from "@/components/layout/Footer";
import SimplePlayer from "@/components/audio/SimplePlayer";
import { NowPlayingProvider, useNowPlaying } from "@/components/now-playing/NowPlayingProvider";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Music } from "lucide-react";
import DjSection from "@/components/sections/DjSection";
import LineupSection from "@/components/sections/LineupSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import LogoAnimation from "@/components/graphics/LogoAnimation";

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

function HomeContent() {
  const { nowPlaying, isLoading } = useNowPlaying();
  // Scroll hook'ları
  const { scrollY } = useScroll();
  
  // Parallax transform'ları
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -300]);
  const turntableY = useTransform(scrollY, [0, 1000], [0, -200]);
  const dotsY = useTransform(scrollY, [0, 1000], [0, -150]);
  const contentY = useTransform(scrollY, [0, 1000], [0, -100]);
  const descriptionY = useTransform(scrollY, [0, 1000], [0, -50]);

  // Random dots - client-side only to avoid hydration mismatch
  const [redDots, setRedDots] = useState<Array<{x: number; y: number; moveX: number[]; moveY: number[]; duration: number}>>([]);
  const [whiteDots, setWhiteDots] = useState<Array<{x: number; y: number; moveX: number[]; moveY: number[]; duration: number}>>([]);

  useEffect(() => {
    setRedDots(
      Array.from({ length: 20 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        moveX: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
        moveY: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
        duration: 10 + Math.random() * 8
      }))
    );
    setWhiteDots(
      Array.from({ length: 15 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        moveX: [0, Math.random() * 50 - 25, Math.random() * 50 - 25, 0],
        moveY: [0, Math.random() * 50 - 25, Math.random() * 50 - 25, 0],
        duration: 12 + Math.random() * 10
      }))
    );
  }, []);

  return (
    <>
      {/* SABİT HEADER - Her zaman üstte */}
      <Header />

      {/* SABİT BACKGROUND ELEMENTLER - Scroll yapılırken yerinde kalır */}
      <div className="fixed inset-0 z-0 bg-apex-background">
        {/* Background Lines - Grid çizgileri */}
        <div className="pointer-events-none absolute inset-0">
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

         {/* Arka plan katmanları - Parallax */}
         <m.div 
           className="hero-bg-outer pointer-events-none absolute inset-0 parallax-element" 
           style={{ y: backgroundY }}
         />
         <m.div 
           className="hero-bg-gradient pointer-events-none absolute inset-0 parallax-element" 
           style={{ y: backgroundY }}
         />
         <m.div 
           className="hero-bg-lines pointer-events-none absolute inset-0 parallax-element" 
           style={{ y: backgroundY }}
         />
         
         {/* TAM EKRAN BACKGROUND IMAGE - Parallax */}
         <m.div 
           className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100 parallax-element"
           style={{
             backgroundImage: "url('/images/home/index_background_v2.png')",
             filter: "brightness(0.7) contrast(1.1)",
             y: backgroundY
           }}
         />
        
        {/* TURNTABLE SVG - Parallax */}
        <m.div 
          className="pointer-events-none absolute inset-0 flex items-center justify-center parallax-element"
          style={{ y: turntableY }}
        >
          <Image 
            src="/images/home/SVG/turntable_V03.svg" 
            alt="Turntable"
            width={1920}
            height={1080}
            className="w-full h-full"
            style={{ objectFit: "cover", objectPosition: "center", opacity: 0.1 }}
          />
          
          {/* SCROLL ANIMASYONLU LOGO - Merkezi pozisyon */}
          <LogoAnimation 
            enableScrollAnimation={true}
            rotationSpeed={0.5}
            maxScroll={500}
          />

          {/* Hareketli Kırmızı ve Beyaz Noktalar - Parallax */}
          <m.div 
            className="absolute inset-0 overflow-hidden parallax-element"
            style={{ y: dotsY }}
          >
            {/* Kırmızı Noktalar */}
            {redDots.map((dot, i) => (
              <m.div
                key={`red-${i}`}
                className="absolute w-1 h-1 rounded-full bg-[#FD1D35]"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  boxShadow: '0 0 8px rgba(253, 29, 53, 0.8)'
                }}
                animate={{
                  x: dot.moveX,
                  y: dot.moveY,
                  scale: [1, 1.8, 1, 1.5, 1],
                  opacity: [0.4, 0.9, 0.5, 0.8, 0.4]
                }}
                transition={{
                  duration: dot.duration,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            {/* Beyaz Noktalar */}
            {whiteDots.map((dot, i) => (
              <m.div
                key={`white-${i}`}
                className="absolute w-1 h-1 rounded-full bg-white"
                style={{
                  left: `${dot.x}%`,
                  top: `${dot.y}%`,
                  boxShadow: '0 0 6px rgba(255, 255, 255, 0.6)'
                }}
                animate={{
                  x: dot.moveX,
                  y: dot.moveY,
                  scale: [1, 1.3, 1, 1.6, 1],
                  opacity: [0.2, 0.6, 0.3, 0.7, 0.2]
                }}
                transition={{
                  duration: dot.duration,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
              />
              ))}
            </m.div>
          </m.div>
      </div>

      {/* SCROLL YAPAN İÇERİK - Background üzerinde kayar */}
      <main className="relative z-10 w-full">
        {/* HOME SECTION - İlk içerik */}
        <section
          id="home"
          className="scroll-snap-start relative flex min-h-screen items-center justify-center overflow-hidden text-white"
        >
           {/* Üst kısım - Yazılar (Yukarıda) - Parallax */}
           <m.div 
             className="absolute top-[calc(20%-30px+30px)] md:top-[calc(20%+30px)] left-0 right-0 z-10 flex flex-col items-center px-4 parallax-element"
             style={{ y: contentY }}
           >
             {/* LIVE Eyebrow */}
             <m.span
               initial={{ opacity: 0, y: 12 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-20%" }}
               transition={{ duration: 0.6 }}
               className="font-antonio inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.45em] text-white/60 mb-4"
             >
               <span className="h-1 w-1 rounded-full bg-[#FD1D35]" />
               LIVE
             </m.span>

             {/* Şarkı Başlığı */}
             <m.div 
               className="whitespace-nowrap font-roboto text-[16px] sm:text-[21px] md:text-[28px] mb-2 motion-element"
               style={{
                 fontStyle: "normal",
                 fontWeight: 500,
                 lineHeight: "1.12",
                 letterSpacing: "0.1em",
                 color: "#FD1D35"
               }}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ 
                 duration: 1, 
                 delay: 0.2, 
                 ease: "easeOut",
                 textShadow: {
                   duration: 1.5,
                   repeat: Infinity,
                   ease: "easeInOut"
                 }
               }}
               animate={{
                 textShadow: [
                   "0 0 30px rgba(253, 29, 53, 1), 0 0 60px rgba(253, 29, 53, 0.8), 0 0 90px rgba(253, 29, 53, 0.6), 0 0 120px rgba(253, 29, 53, 0.4)",
                   "0 0 50px rgba(253, 29, 53, 1), 0 0 100px rgba(253, 29, 53, 1), 0 0 150px rgba(253, 29, 53, 0.8), 0 0 200px rgba(253, 29, 53, 0.6)",
                   "0 0 30px rgba(253, 29, 53, 1), 0 0 60px rgba(253, 29, 53, 0.8), 0 0 90px rgba(253, 29, 53, 0.6), 0 0 120px rgba(253, 29, 53, 0.4)"
                 ]
               }}
             >
{(nowPlaying.title?.trim() || "LIVE STREAM").toLocaleUpperCase('en-US')}
             </m.div>

             {/* Sanatçı Adı */}
             <m.div 
               className="whitespace-nowrap font-roboto text-[10px] sm:text-[12px] md:text-[14px] mb-8 motion-element"
               style={{
                 fontStyle: "normal",
                 fontWeight: 400,
                 lineHeight: "1.12",
                 letterSpacing: "0.1em",
                 color: "#FFFFFF"
               }}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
             >
{(nowPlaying.artist?.trim() || "RADIO APEX").toLocaleUpperCase('en-US')}
             </m.div>

           </m.div>

           {/* Orta kısım - Player (PLAY BUTONU TAM ORTADA - SCROLL İLE KAYAR) */}
           <m.div 
             className="relative z-10 flex h-full w-full items-center justify-center motion-element"
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
           >
             <div className="translate-y-10">
               <SimplePlayer />
             </div>
           </m.div>

           {/* Açıklama Metni - Player'ın altında */}
           <m.div 
             className="absolute bottom-[calc(50%-370px)] left-0 right-0 z-10 flex justify-center px-4 motion-element parallax-element"
             style={{ y: descriptionY }}
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
           >
             <div className="font-spaceGrotesk text-sm sm:text-base px-4 max-w-[791px] text-center"
               style={{
                 fontStyle: "normal",
                 fontWeight: 400,
                 lineHeight: "1.25",
                 color: "#FFFFFF"
               }}
             >
               Radio Apex is an experimental space broadcasting electronic, ambient, avant-garde, and boundary-pushing sounds 24/7. Sit back and drift away — or turn up the volume and dive in.
             </div>
           </m.div>

        </section>
        
        {/* DİĞER BÖLÜMLER - Parallax scroll efektleriyle */}
        
        <m.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <DjSection />
        </m.div>
        
        <m.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <LineupSection />
        </m.div>
        
        <m.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <AboutSection />
        </m.div>
        
        <m.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <ContactSection />
        </m.div>
        
         {/* SABİT FOOTER VE SOSYAL MEDYA */}
         <div className="fixed bottom-0 left-0 right-0 z-40">
           {/* Sosyal Medya İkonları */}
           <m.div 
             className="flex items-center justify-center gap-4 pb-20"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
           >
             {socials.map((social, index) => {
               const Icon = social.icon;
               return (
                 <m.div
                   key={social.label}
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ duration: 0.4, delay: 0.9 + index * 0.1, ease: "easeOut" }}
                 >
                   <Button
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
                 </m.div>
               );
             })}
           </m.div>
           
           <Footer />
         </div>
      </main>
    </>
  );
}

export default function Page() {
  return (
    <NowPlayingProvider>
      <HomeContent />
    </NowPlayingProvider>
  );
}