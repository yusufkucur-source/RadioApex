"use client";

import { useMemo } from "react";
import { m } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { useDJs, useLineup } from "@/lib/firebase/hooks";

export default function LineupSection() {
  const { data: lineup } = useLineup();
  const { data: djs } = useDJs();

  const djMap = new Map(djs.map(dj => [dj.id, dj]));

  // Sort lineup by day (Monday -> Sunday) and time
  const sortedLineup = useMemo(() => {
    const dayOrder = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7
    };

    return [...lineup].sort((a, b) => {
      // First, sort by day
      const dayA = dayOrder[a.day as keyof typeof dayOrder] || 999;
      const dayB = dayOrder[b.day as keyof typeof dayOrder] || 999;
      
      if (dayA !== dayB) {
        return dayA - dayB;
      }

      // If same day, sort by start time
      const timeA = a.startTime.replace(':', '');
      const timeB = b.startTime.replace(':', '');
      return timeA.localeCompare(timeB);
    });
  }, [lineup]);

  return (
    <section
      id="line-up"
      className="section-padding scroll-snap-start relative flex min-h-screen flex-col justify-center"
    >
      {/* Title - İlk önce yukarı çıkar */}
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: "0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeading
          eyebrow="Weekly Stream"
          title="Apex weekly stream"
          titleClassName="text-[#FD1D35]"
          description="Radio Apex keeps the pulse of electronic music alive with a seamless flow of sound through every hour of the day. After 8 PM, the energy rises — from deep house to techno, from chill sets to late-night afterhours. Pure rhythm, atmosphere, and motion — on Apex, the night never ends."
          align="center"
        />
      </m.div>

      {/* Lineup items - Stagger ile birer birer gelir */}
      <div className="mt-16 grid gap-6">
        {sortedLineup.map((slot, index) => {
          const dj = slot.djId ? djMap.get(slot.djId) : undefined;
          return (
            <m.div
              key={slot.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px", amount: 0.2 }}
              transition={{ 
                delay: index * 0.05, 
                duration: 0.5, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="group flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-apex-secondary/70 hover:shadow-apex-secondary/20 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
            >
              <div>
                <span className="font-antonio text-xs uppercase tracking-[0.35em] text-white/50">
                  {slot.day}
                </span>
                <h3 className="font-roboto mt-3 text-2xl font-semibold text-white">
                  {slot.title}
                </h3>
                <p className="font-antonio mt-2 text-sm uppercase tracking-[0.3em] text-apex-secondary/80">
                  {slot.genre}
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 text-sm text-white/70 sm:items-end">
                <div className="font-antonio flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60">
                  <span>{slot.startTime}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{slot.endTime}</span>
                </div>
                {dj ? (
                  <div className="text-right">
                    <p className="font-roboto text-sm font-semibold text-white">
                      {dj.nickname}
                    </p>
                    <p className="font-antonio text-xs uppercase tracking-[0.25em] text-white/50">
                      {dj.city}
                    </p>
                  </div>
                ) : (
                  <p className="font-antonio text-xs uppercase tracking-[0.3em] text-white/40">
                    No DJ assigned
                  </p>
                )}
              </div>
            </m.div>
          );
        })}
      </div>
    </section>
  );
}
