"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";

const paragraphs = [
  "Radio Apex, bağımsız elektronik müzik sahnesine ses veren dijital bir radyo platformu. İstanbul ve Avrupa’daki DJ kolektiflerini aynı frekansta buluşturarak gecenin ritmini izleyicilere taşıyoruz.",
  "Her yayın, atmosfer tasarımı ve görsel-işitsel kurgu ile desteklenir; dinleyenlerin sadece müzik değil aynı zamanda bir deneyim yaşamasını hedefleriz.",
  "Admin paneli üzerinden yayın akışını, DJ kadrosunu ve özel etkinlik anonslarını gerçek zamanlı yönetebilirsiniz."
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="section-padding scroll-snap-start relative flex min-h-screen flex-col justify-center"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_65%)]" />

      <SectionHeading
        eyebrow="Hakkımızda"
        title="Radio Apex kimdir?"
        description="Modern, minimal ve immersive bir radyo deneyimi. Apex ekibi gecenin enerjisini şehre yaymak için içerik üretir."
      />

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {paragraphs.map((text, index) => (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: index * 0.08, duration: 0.6 }}
            className="text-base leading-relaxed text-white/70"
          >
            {text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
