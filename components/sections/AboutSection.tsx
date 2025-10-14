"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";

const paragraphs = [
  "Radio Apex is an independent sonic platform exploring the outer edges of sound and emotion. Broadcasting 24/7, it blends electronic, ambient, and avant-garde textures into an ever-evolving experience — a living space for deep listeners, curious minds, and nocturnal dreamers.",
  "More than a radio, Apex is a field of experimentation where boundaries blur between genres, moods, and frequencies. Each set, mix, and transmission is a journey — sometimes meditative, sometimes chaotic, always alive.",
  "Whether you lean back and let the sound flow through you, or turn up the volume and dive in, Radio Apex invites you to listen beyond the ordinary."
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="section-padding scroll-snap-start relative flex min-h-screen flex-col justify-center"
    >
      {/* Title - İlk önce yukarı çıkar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: "0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeading
          eyebrow="About Us"
          title="Radio Apex"
          description="An independent sonic platform for deep listeners, curious minds, and nocturnal dreamers."
          titleClassName="text-[#FD1D35]"
        />
      </motion.div>

      {/* Paragraflar - Stagger ile birer birer gelir */}
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {paragraphs.map((text, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px", amount: 0.3 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.5, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="text-base leading-relaxed text-white/70"
          >
            {text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
