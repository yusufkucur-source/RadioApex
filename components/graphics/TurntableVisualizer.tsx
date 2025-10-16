"use client";

import type { PropsWithChildren } from "react";
import { useEffect, useState, useRef } from "react";

const ROTATION_KEYWORDS = ["text", "copy", "label", "dots", "point", "circle", "ring"];

interface TurntableVisualizerProps {
  isFullScreen?: boolean;
  enableScrollAnimation?: boolean;
  scrollStartOffset?: number;
  scrollEndOffset?: number;
  className?: string;
}

export default function TurntableVisualizer({
  children,
  isFullScreen = false,
  enableScrollAnimation = false,
  scrollStartOffset = 0.1,
  scrollEndOffset = 0.5,
  className = ""
}: PropsWithChildren<TurntableVisualizerProps>) {
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSvg() {
      try {
        const response = await fetch("/images/home/turntable_03_variation_B_original_colors.svg");
        if (!response.ok) {
          throw new Error(`Failed to load turntable svg: ${response.status}`);
        }
        const raw = await response.text();
        if (cancelled) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(raw, "image/svg+xml");
        const svgElement = doc.documentElement;

        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
        svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svgElement.setAttribute(
          "class",
          `${svgElement.getAttribute("class") ?? ""} hero-turntable-svg`.trim()
        );

        // Tüm grupları ve elementleri bul
        const allElements = Array.from(svgElement.querySelectorAll("*"));
        
        allElements.forEach((element, index) => {
          const descriptor = `${element.getAttribute("id") ?? ""} ${element.getAttribute("class") ?? ""} ${element.getAttribute("data-name") ?? ""}`.toLowerCase();
          const tagName = element.tagName.toLowerCase();
          
          // Metin elementleri ve daireler için animasyon ekle
          const shouldAnimate = 
            tagName === "text" || 
            tagName === "circle" || 
            tagName === "g" ||
            ROTATION_KEYWORDS.some(keyword => descriptor.includes(keyword));

          if (shouldAnimate) {
            const existing = element.getAttribute("class") ?? "";
            const direction = index % 2 === 0 ? "hero-turntable-spin" : "hero-turntable-spin-reverse";
            element.setAttribute("class", `${existing} ${direction}`.trim());
          }
        });

        if (!cancelled) {
          setSvgMarkup(svgElement.outerHTML);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setSvgMarkup(null);
        }
      }
    }

    void loadSvg();
    return () => {
      cancelled = true;
    };
  }, []);

  // Scroll animasyonu için useEffect
  useEffect(() => {
    if (!enableScrollAnimation) return;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      
      // Belirtilen aralıkta animasyonu çalıştır
      if (scrollPercent >= scrollStartOffset && scrollPercent <= scrollEndOffset) {
        const progress = (scrollPercent - scrollStartOffset) / (scrollEndOffset - scrollStartOffset);
        setScrollProgress(progress);
        
        // SVG path'lerini animasyonlu olarak çiz
        const svgElement = svgRef.current?.querySelector('svg');
        if (svgElement) {
          const paths = svgElement.querySelectorAll('path');
          paths.forEach((path) => {
            const length = path.getTotalLength();
            const drawLength = length * progress;
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length - drawLength}`;
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // İlk yüklemede çalıştır

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enableScrollAnimation, scrollStartOffset, scrollEndOffset]);

  // Tam ekran modu - Figma tasarımındaki gibi
  if (isFullScreen) {
    return (
      <div className="hero-turntable-fullscreen w-full h-full flex items-center justify-center">
        {/* SVG içeriği - TAM EKRAN */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {svgMarkup ? (
            <div
              ref={svgRef}
              className="w-full h-full"
              aria-hidden="true"
              style={{
                maxWidth: "min(90vw, 90vh)",
                maxHeight: "min(90vw, 90vh)",
                aspectRatio: "1"
              }}
              dangerouslySetInnerHTML={{ __html: svgMarkup }}
            />
          ) : (
            <div 
              className="rounded-full border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-40"
              style={{
                width: "min(90vw, 90vh)",
                height: "min(90vw, 90vh)"
              }}
            />
          )}
        </div>
        
        {/* Merkezi glow efekti */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div 
            className="rounded-full bg-[radial-gradient(circle_at_center,rgba(240,72,104,0.15),transparent_70%)]"
            style={{
              width: "min(90vw, 90vh)",
              height: "min(90vw, 90vh)"
            }}
          />
        </div>

        {children}
      </div>
    );
  }

  // Normal mod - Küçük turntable
  return (
    <div className={`hero-turntable relative aspect-square w-[500px] h-[500px] flex-shrink-0 ${className}`}>
      {/* Gradyan katmanları */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-2 rounded-full border border-white/15" />
      <div className="pointer-events-none absolute inset-6 rounded-full border border-white/8" />
      <div className="pointer-events-none absolute inset-12 rounded-full border border-white/5" />

      {/* SVG içeriği */}
      <div className="pointer-events-none absolute inset-0">
        {svgMarkup ? (
          <div
            ref={svgRef}
            className="h-full w-full"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />
        ) : (
          <div className="h-full w-full rounded-full border border-white/10 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-40" />
        )}
      </div>

      {/* Ek dairesel katmanlar */}
      <div className="pointer-events-none absolute inset-16 rounded-full border border-white/5 opacity-60" />
      <div className="pointer-events-none absolute inset-20 rounded-full border border-white/3 opacity-40" />
      
      {/* Merkezi glow efekti */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(240,72,104,0.12),transparent_65%)]" />

      {/* Merkezi play butonu alanı */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
