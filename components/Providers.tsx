"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { NowPlayingProvider } from "@/components/now-playing/NowPlayingProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <NowPlayingProvider>{children}</NowPlayingProvider>
    </LazyMotion>
  );
}
