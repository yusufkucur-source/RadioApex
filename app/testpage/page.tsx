"use client";

import { useState, useEffect } from "react";
import { m, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import LogoAnimation from "@/components/graphics/LogoAnimation";

function TestPageContent() {
  // Scroll hook'ları
  const { scrollY } = useScroll();
  
  // Parallax transform'ları
  const backgroundY = useTransform(scrollY, [0, 1000], [0, -300]);
  const turntableY = useTransform(scrollY, [0, 1000], [0, -200]);
  const dotsY = useTransform(scrollY, [0, 1000], [0, -150]);

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
      
      {/* Sadece arka plan görünümü */}
      <main className="relative z-10 min-h-screen" />
    </>
  );
}

export default function TestPage() {
  return <TestPageContent />;
}
