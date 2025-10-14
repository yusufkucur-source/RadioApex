"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/navigation/Header";
import Footer from "@/components/layout/Footer";
import SimplePlayer from "@/components/audio/SimplePlayer";
import { NowPlayingProvider } from "@/components/now-playing/NowPlayingProvider";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Music } from "lucide-react";
import DjSection from "@/components/sections/DjSection";
import LineupSection from "@/components/sections/LineupSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";

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
  // Scroll hook'ları
  const { scrollY } = useScroll();
  
  // Parallax transform'ları
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -300]);
  const turntableY = useTransform(scrollY, [0, 1000], [0, -200]);
  const dotsY = useTransform(scrollY, [0, 1000], [0, -150]);
  const contentY = useTransform(scrollY, [0, 1000], [0, -100]);

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
    <NowPlayingProvider>
      {/* SABİT HEADER - Her zaman üstte */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Header />
      </motion.div>

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
         <motion.div 
           className="hero-bg-outer pointer-events-none absolute inset-0" 
           style={{ y: backgroundY }}
         />
         <motion.div 
           className="hero-bg-gradient pointer-events-none absolute inset-0" 
           style={{ y: backgroundY }}
         />
         <motion.div 
           className="hero-bg-lines pointer-events-none absolute inset-0" 
           style={{ y: backgroundY }}
         />
         
         {/* TAM EKRAN BACKGROUND IMAGE - Parallax */}
         <motion.div 
           className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
           style={{
             backgroundImage: "url('/images/home/index_background_v2.png')",
             filter: "brightness(0.7) contrast(1.1)",
             y: backgroundY
           }}
         />
        
        {/* TURNTABLE SVG - Parallax */}
        <motion.div 
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ y: turntableY }}
        >
          <img 
            src="/images/home/SVG/turntable_V03.svg" 
            alt="Turntable"
            className="w-full h-full"
            style={{ objectFit: "cover", objectPosition: "center", opacity: 0.1 }}
          />
          
          {/* Hareketli Kırmızı ve Beyaz Noktalar - Parallax */}
          <motion.div 
            className="absolute inset-0 overflow-hidden"
            style={{ y: dotsY }}
          >
            {/* Kırmızı Noktalar */}
            {redDots.map((dot, i) => (
              <motion.div
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
              <motion.div
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
            </motion.div>
          </motion.div>
      </div>

      {/* SCROLL YAPAN İÇERİK - Background üzerinde kayar */}
      <main className="relative z-10 w-full">
        {/* HOME SECTION - İlk içerik */}
        <section
          id="home"
          className="scroll-snap-start relative flex min-h-screen items-center justify-center overflow-hidden text-white"
        >
           {/* Üst kısım - Yazılar (Yukarıda) - Parallax */}
           <motion.div 
             className="absolute top-[calc(20%-30px)] md:top-[20%] left-0 right-0 z-10 flex flex-col items-center px-4"
             style={{ y: contentY }}
           >
             {/* FEEL GOOD SOUND. - Başlık */}
             <motion.div 
               className="whitespace-nowrap font-roboto text-[32px] sm:text-[42px] md:text-[57px] mb-8"
               style={{
                 fontStyle: "normal",
                 fontWeight: 500,
                 lineHeight: "1.12",
                 letterSpacing: "-0.25px",
                 color: "#FD1D35"
               }}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
             >
               FEEL GOOD SOUND.
             </motion.div>

             {/* Açıklama Metni */}
             <motion.div 
               className="font-spaceGrotesk text-sm sm:text-base px-4 max-w-[791px]"
               style={{
                 fontStyle: "normal",
                 fontWeight: 400,
                 lineHeight: "1.25",
                 textAlign: "center",
                 color: "#FFFFFF"
               }}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
             >
               Radio Apex is an experimental space broadcasting electronic, ambient, avant-garde, and boundary-pushing sounds 24/7. Sit back and drift away — or turn up the volume and dive in.
             </motion.div>
           </motion.div>

           {/* Orta kısım - Player (PLAY BUTONU TAM ORTADA - SCROLL İLE KAYAR) */}
           <motion.div 
             className="relative z-10 flex h-full w-full items-center justify-center"
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
           >
             <div className="translate-y-10">
               <SimplePlayer />
             </div>
           </motion.div>


        </section>
        
        {/* DİĞER BÖLÜMLER - Parallax scroll efektleriyle */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <DjSection />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <LineupSection />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <AboutSection />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1, margin: "0px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <ContactSection />
        </motion.div>
        
         {/* SABİT FOOTER VE SOSYAL MEDYA */}
         <div className="fixed bottom-0 left-0 right-0 z-40">
           {/* Sosyal Medya İkonları */}
           <motion.div 
             className="flex items-center justify-center gap-4 pb-20"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
           >
             {socials.map((social, index) => {
               const Icon = social.icon;
               return (
                 <motion.div
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
                 </motion.div>
               );
             })}
           </motion.div>
           
           <Footer />
         </div>
      </main>
    </NowPlayingProvider>
  );
}
