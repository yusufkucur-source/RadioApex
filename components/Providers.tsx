"use client";

import { NowPlayingProvider } from "@/components/now-playing/NowPlayingProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <NowPlayingProvider>{children}</NowPlayingProvider>;
}
