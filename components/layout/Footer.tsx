"use client";

import NowPlayingTicker from "@/components/now-playing/NowPlayingTicker";

const links = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "SoundCloud", href: "https://soundcloud.com" },
  { label: "Mixcloud", href: "https://www.mixcloud.com" }
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black/60 backdrop-blur-3xl">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12 sm:px-10 lg:px-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">Radio Apex</h3>
            <p className="mt-2 text-sm text-white/60">
              Modern online radyo deneyimi. Gecenin ritmini Apex frekansında
              yakalayın.
            </p>
          </div>
          <div className="flex gap-4 text-sm text-white/60">
            {links.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-apex-accent hover:text-apex-accent"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/50 px-4 py-3">
          <NowPlayingTicker />
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40">
          © {new Date().getFullYear()} Radio Apex. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
