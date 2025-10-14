"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { useDJs } from "@/lib/firebase/hooks";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delayChildren: 0.2,
      staggerChildren: 0.08
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: "easeOut"
    }
  }
};

const metricVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  soundcloud: "SoundCloud",
  mixcloud: "Mixcloud"
};

function toInitials(value?: string) {
  if (!value) return "DJ";
  const segments = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(segment => segment[0]?.toUpperCase() ?? "");
  const fallback = value.slice(0, 2).toUpperCase();
  return segments.join("") || fallback || "DJ";
}

export default function DjSection() {
  const { data: djs } = useDJs();

  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    djs.forEach(dj => {
      const city = dj.city?.trim().toLowerCase();
      if (city) {
        cities.add(city);
      }
    });
    return cities.size;
  }, [djs]);

  const metrics = useMemo(
    () => [
      {
        label: "Aktif DJ",
        value:
          djs.length > 0 ? djs.length.toString().padStart(2, "0") : "\u2014",
        caption: "Radio Apex roster"
      },
      {
        label: "Sehir",
        value:
          uniqueCities > 0
            ? uniqueCities.toString().padStart(2, "0")
            : "\u2014",
        caption: "Global frekanslar"
      },
      {
        label: "Yayin",
        value: "24/7",
        caption: "Elektronik yayin akisi"
      }
    ],
    [djs.length, uniqueCities]
  );

  return (
    <section
      id="dj-list"
      className="section-padding scroll-snap-start relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top,rgba(253,29,53,0.16),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_60%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "140px 140px"
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-48 bg-gradient-to-b from-black via-black/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-black via-black/30 to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1399px] flex-col gap-16 px-4 py-24 sm:px-6 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-10"
          >
            <SectionHeading
              eyebrow="DJ Line"
              title="Radio Apex DJ kadrosu"
              description="Sehrin farkli kose noktalarindan Apex frekansina baglanan DJ'ler, her seans icin ozel setler hazirliyor. Modern, minimal ve akiskan bir deneyim icin tasarlandi."
            />

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delayChildren: 0.2, staggerChildren: 0.1 }}
              className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1"
            >
              {metrics.map(metric => (
                <motion.li
                  key={metric.label}
                  variants={metricVariants}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-5 backdrop-blur-xl transition duration-500 hover:border-apex-secondary/60 hover:bg-white/[0.08]"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/40">
                    {metric.caption}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3"
          >
            {djs.map(dj => {
              const socialEntries = Object.entries(dj.socials ?? {}).filter(
                ([, href]) => Boolean(href)
              );

              return (
                <motion.article
                  key={dj.id}
                  variants={cardVariants}
                  whileHover={{ translateY: -12 }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_40px_80px_rgba(5,5,9,0.55)] backdrop-blur-2xl transition-colors duration-500"
                >
                  <div
                    className="pointer-events-none absolute -inset-px -z-10 rounded-[30px] opacity-0 transition duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(253,29,53,0.45), rgba(14,165,233,0.35))"
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 -z-20 rounded-[36px] bg-black/50 blur-3xl" />

                  <div className="relative overflow-hidden rounded-2xl border border-white/10">
                    {dj.photoUrl ? (
                      <Image
                        src={dj.photoUrl}
                        alt={dj.nickname}
                        width={480}
                        height={480}
                        className="h-56 w-full object-cover transition duration-700 group-hover:scale-105"
                        sizes="(min-width: 1280px) 18vw, (min-width: 768px) 34vw, 90vw"
                      />
                    ) : (
                      <div className="flex h-56 w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(253,29,53,0.25),rgba(14,165,233,0.2))] text-4xl font-semibold text-white/40">
                        {toInitials(dj.nickname || dj.fullName)}
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 transition duration-500 group-hover:opacity-60" />
                    <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/80 backdrop-blur">
                      <span className="h-1 w-1 rounded-full bg-[#FD1D35]" />
                      <span>{dj.city || "Konum bilinmiyor"}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-white">
                        {dj.nickname}
                      </h3>
                      {dj.fullName ? (
                        <p className="mt-1 text-sm text-white/60">
                          {dj.fullName}
                        </p>
                      ) : null}
                    </div>

                    {dj.description ? (
                      <p className="text-sm leading-relaxed text-white/70">
                        {dj.description}
                      </p>
                    ) : (
                      <p className="text-sm text-white/50">
                        Ses frekanslarini Apex estetikleriyle birlestiren ozel
                        performans.
                      </p>
                    )}

                    {socialEntries.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {socialEntries.map(([key, href]) => (
                          <a
                            key={key}
                            href={href as string}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-white/70 transition duration-300 hover:border-[#FD1D35]/80 hover:text-[#FD1D35]"
                          >
                            {SOCIAL_LABELS[key] ?? key}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
