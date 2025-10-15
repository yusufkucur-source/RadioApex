"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

const SECTIONS = [
  { id: "home", label: "HOME" },
  { id: "dj-list", label: "DJ LIST" },
  { id: "line-up", label: "LINEUP" },
  { id: "about", label: "ABOUT" },
  { id: "contact", label: "CONTACT" }
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function useActiveSection() {
  const [active, setActive] = useState<SectionId>("home");
  const scrollingRef = useRef(false);

  useEffect(() => {
    // Intersection Observer ile section'ları izle
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Üstten %20, alttan %60 margin (section ortaya geldiğinde aktif olur)
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Scroll sırasında güncelleme yapma
      if (scrollingRef.current) return;

      // Görünür section'ları bul
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target.id as SectionId);

      // Eğer görünür section varsa, ilkini aktif yap
      if (visibleSections.length > 0) {
        // Section sırasına göre en üsttekini seç
        const firstVisibleSection = SECTIONS.find(section => 
          visibleSections.includes(section.id)
        );
        
        if (firstVisibleSection) {
          setActive(firstVisibleSection.id);
        }
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Tüm section'ları gözlemle
    SECTIONS.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return { active, setActive, scrollingRef };
}

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { active: activeSection, setActive: setActiveSection, scrollingRef } = useActiveSection();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navItems = useMemo(
    () =>
      SECTIONS.map(section => ({
        ...section,
        href: `#${section.id}`
      })),
    []
  );

  const handleNavClick = (id: SectionId) => {
    const element = document.getElementById(id);
    if (!element) return;
    
    // Scroll sırasında active section güncellenmesini engelle
    scrollingRef.current = true;
    
    // Hemen active section'ı güncelle
    setActiveSection(id);
    
    // Smooth scroll
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    
    // Scroll bittiğinde scroll tracking'i tekrar aktif et
    // Smooth scroll genellikle 500-800ms sürer, güvenli bir süre ver
    setTimeout(() => {
      scrollingRef.current = false;
    }, 1200);
    
    setMenuOpen(false);
  };

  return (
    <>
      <header className="fixed left-4 right-4 top-4 sm:top-6 md:top-[27px] z-[100] mx-auto flex h-[60px] max-w-[1399px] items-center justify-between rounded-[50px] border border-[rgba(154,154,154,0.2)] bg-black/30 px-4 sm:px-6 md:px-8 backdrop-blur-3xl transition-all duration-500 overflow-hidden">
      <button
        onClick={() => handleNavClick("home")}
        className="flex items-center font-anton text-[16px] sm:text-[20px] md:text-[22px] uppercase leading-none tracking-[0.3em] sm:tracking-[0.5em] text-white transition hover:text-[#FD1D35] ml-2 sm:ml-4 md:ml-6 nav-text-glow"
      >
        RADIO APEX
      </button>

      <nav className="hidden items-center gap-10 lg:flex mr-2 sm:mr-4 md:mr-6">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id as SectionId)}
            className={clsx(
              "relative px-4 py-2 font-antonio text-[15px] uppercase leading-[19px] tracking-[0.2em] transition duration-300 nav-text-glow",
              activeSection === item.id 
                ? "text-white" 
                : "text-white hover:text-[#FD1D35]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD1D35]"
            )}
          >
            {activeSection === item.id && (
              <motion.span
                layoutId="activeNav"
                className="absolute inset-0 rounded-[15px] bg-[#FD1D35] nav-glow"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={() => setMenuOpen(!isMenuOpen)}
        className={clsx(
          "relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white transition lg:hidden mr-2 sm:mr-4 md:mr-6",
          "hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
        )}
        aria-label="Menu"
      >
        <div className="flex h-5 w-5 flex-col justify-between">
          <span
            className={clsx(
              "h-0.5 w-full rounded-full bg-white transition-transform duration-300",
              isMenuOpen ? "translate-y-2 rotate-45" : ""
            )}
          />
          <span
            className={clsx(
              "h-0.5 w-full rounded-full bg-white transition-opacity duration-300",
              isMenuOpen ? "opacity-0" : "opacity-100"
            )}
          />
          <span
            className={clsx(
              "h-0.5 w-full rounded-full bg-white transition-transform duration-300",
              isMenuOpen ? "-translate-y-2 -rotate-45" : ""
            )}
          />
        </div>
      </button>

      </header>

      {/* Menu - Header'ın dışında */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay - Tüm ekranı kaplar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[90] bg-black/30 lg:hidden"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Menu - Backdrop üzerinde */}
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="fixed left-4 right-4 top-20 rounded-3xl border border-white/15 bg-black/30 p-4 shadow-2xl lg:hidden z-[101]"
              style={{
                backdropFilter: 'blur(100px) saturate(200%)',
                WebkitBackdropFilter: 'blur(100px) saturate(200%)'
              }}
            >
              <ul className="grid gap-0 text-center">
                {navItems.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id as SectionId)}
                      className={clsx(
                        "w-full rounded-2xl px-4 py-3 text-base font-medium text-white transition nav-text-glow",
                        activeSection === item.id 
                          ? "bg-[#FD1D35] nav-glow" 
                          : "hover:bg-[#FD1D35]/20 hover:text-[#FD1D35]"
                      )}
                    >
                      {item.label}
                    </button>
                    {index < navItems.length - 1 && (
                      <div className="mx-4 my-2 h-px bg-white/10" />
                    )}
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
