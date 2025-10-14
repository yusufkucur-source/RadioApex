"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";

type FormState = "idle" | "sending" | "success" | "error";

export default function ContactSection() {
  const [state, setState] = useState<FormState>("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("sending");

    setTimeout(() => {
      setState("success");
      event.currentTarget.reset();
    }, 900);
  };

  return (
    <section
      id="contact"
      className="section-padding scroll-snap-start relative flex min-h-screen flex-col justify-center"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(217,70,239,0.18),transparent_65%)]" />

      <SectionHeading
        eyebrow="İletişim"
        title="Frekansa katıl"
        description="Etkinlik duyuruları, canlı yayın desteği veya iş birlikleri için bizimle iletişime geçin."
        align="center"
      />

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6 }}
        className="mx-auto mt-16 grid w-full max-w-3xl gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="grid gap-3">
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">
            İsim
          </label>
          <input
            required
            type="text"
            name="name"
            placeholder="Adınız"
            className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-accent focus:bg-black/60"
          />
        </div>

        <div className="grid gap-3">
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">
            E-posta
          </label>
          <input
            required
            type="email"
            name="email"
            placeholder="you@example.com"
            className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-secondary focus:bg-black/60"
          />
        </div>

        <div className="grid gap-3">
          <label className="text-xs uppercase tracking-[0.3em] text-white/60">
            Mesaj
          </label>
          <textarea
            required
            name="message"
            rows={5}
            placeholder="Mesajınızı paylaşın..."
            className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none transition focus:border-apex-accent focus:bg-black/60"
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={state === "sending"}
          className="flex h-12 items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-apex-accent via-apex-accent/80 to-apex-secondary/80 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-80"
        >
          {state === "idle" && "Gönder"}
          {state === "sending" && "Gönderiliyor..."}
          {state === "success" && "Mesaj gönderildi"}
          {state === "error" && "Hata oluştu, tekrar deneyin"}
        </motion.button>
      </motion.form>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto mt-10 max-w-2xl text-center text-sm text-white/50"
      >
        Form gönderimleri şu anda demo modunda. Admin paneli entegre edildiğinde
        Firestore veya tercih edilen e-posta servisi ile bağlayabilirsiniz.
      </motion.p>
    </section>
  );
}
