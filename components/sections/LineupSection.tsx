"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { useDJs, useLineup } from "@/lib/firebase/hooks";

export default function LineupSection() {
  const { data: lineup } = useLineup();
  const { data: djs } = useDJs();

  const djMap = new Map(djs.map(dj => [dj.id, dj]));

  return (
    <section
      id="line-up"
      className="section-padding scroll-snap-start relative flex min-h-screen flex-col justify-center"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,rgba(14,165,233,0.12),transparent_60%)]" />

      <SectionHeading
        eyebrow="Line Up"
        title="Haftalık Apex yayın akışı"
        description="Her yayın zaman dilimi için seçilen DJ performansları ve türler. Admin paneli ile anlık güncellemeler yapılabilir."
        align="center"
      />

      <div className="mt-16 grid gap-6">
        {lineup.map((slot, index) => {
          const dj = slot.djId ? djMap.get(slot.djId) : undefined;
          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ delay: index * 0.04, duration: 0.6 }}
              className="group flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-apex-secondary/70 hover:shadow-apex-secondary/20 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
            >
              <div>
                <span className="text-xs uppercase tracking-[0.35em] text-white/50">
                  {slot.day}
                </span>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  {slot.title}
                </h3>
                <p className="mt-2 text-sm uppercase tracking-[0.3em] text-apex-secondary/80">
                  {slot.genre}
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 text-sm text-white/70 sm:items-end">
                <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60">
                  <span>{slot.startTime}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30" />
                  <span>{slot.endTime}</span>
                </div>
                {dj ? (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">
                      {dj.nickname}
                    </p>
                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                      {dj.city}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                    DJ atanmadı
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
