"use client";

import { m } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";

const paragraphs = [
  "Radio Apex is an independent and innovative sonic platform crafted for deep listeners, curious minds, and nocturnal dreamers. Exploring the outer edges of sound and emotion, Radio Apex broadcasts 24/7, blending the evolving textures of deep house, tech house, and techno into a continuously developing experience. Our commitment is to offer the best music through a meticulous selection process, ensuring quality and innovation in every transmission.",
  "More than a conventional radio station, Apex is a living field of experimentation where the boundaries between genres, moods, and frequencies delightfully blur. Our team of DJs brings years of experience in Electronic Dance Music, valuing the importance of making conscious choices that can add something meaningful to our listeners' lives. Every DJ set, DJ mix, and live transmission is a journey: sometimes meditative, sometimes energetic, but always spirited and full of discovery.",
  "This is not just a broadcast; it is a living space for deep listeners, curious minds, and nocturnal dreamers."
];

export default function AboutSection() {
  return (
    <section
      id="about"
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
          eyebrow="About Us"
          title="Radio Apex"
          description="An independent sonic platform for deep listeners, curious minds, and nocturnal dreamers."
          titleClassName="text-[#FD1D35]"
        />
      </m.div>

      {/* Paragraflar - Stagger ile birer birer gelir */}
      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {paragraphs.map((text, index) => (
          <m.p
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px", amount: 0.3 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.5, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            className="font-spaceGrotesk text-base leading-relaxed text-white/70"
          >
            {text}
          </m.p>
        ))}
      </div>
    </section>
  );
}
