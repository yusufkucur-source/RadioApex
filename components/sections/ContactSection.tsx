"use client";

import { FormEvent, useState } from "react";
import { m } from "framer-motion";
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
      className="section-padding scroll-snap-start relative flex min-h-screen flex-col justify-center pb-[242px] sm:pb-56 md:pb-64 lg:pb-72"
    >
      {/* Title - İlk önce yukarı çıkar */}
      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: "0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <SectionHeading
          eyebrow="Contact"
          title="Join the frequency"
          description="Get in touch for event announcements, live broadcast support, or collaborations."
          align="center"
          titleClassName="text-[#FD1D35]"
        />
      </m.div>

      {/* Form - Title'dan sonra gelir */}
      <m.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px", amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-16 mb-20 sm:mb-18 md:mb-16 lg:mb-16 grid w-full max-w-3xl gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="grid gap-3">
          <label className="font-antonio text-xs uppercase tracking-[0.3em] text-white/60">
            Name
          </label>
          <input
            required
            type="text"
            name="name"
            placeholder="Your name"
            className="font-spaceGrotesk h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-accent focus:bg-black/60"
          />
        </div>

        <div className="grid gap-3">
          <label className="font-antonio text-xs uppercase tracking-[0.3em] text-white/60">
            Email
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
          <label className="font-antonio text-xs uppercase tracking-[0.3em] text-white/60">
            Message
          </label>
          <textarea
            required
            name="message"
            rows={5}
            placeholder="Share your message..."
            className="font-spaceGrotesk rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white outline-none transition focus:border-apex-accent focus:bg-black/60"
          />
        </div>

        <m.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          disabled={state === "sending"}
          className="font-roboto flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-apex-accent via-apex-accent/80 to-apex-secondary/80 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-80"
        >
          {state === "idle" && "Send"}
          {state === "sending" && "Sending..."}
          {state === "success" && "Message sent"}
          {state === "error" && "Error occurred, try again"}
        </m.button>
      </m.form>

    </section>
  );
}
