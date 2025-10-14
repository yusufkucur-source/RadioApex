"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type NowPlayingPayload = {
  title: string;
  artist: string;
  isLive: boolean;
  startedAt: string | null;
};

type NowPlayingContextValue = {
  nowPlaying: NowPlayingPayload;
  isLoading: boolean;
  refresh: () => void;
};

const defaultState: NowPlayingPayload = {
  title: "Radio Apex Stream",
  artist: "Live DJ Set",
  isLive: true,
  startedAt: null
};

const NowPlayingContext = createContext<NowPlayingContextValue | undefined>(
  undefined
);

async function fetchNowPlaying(): Promise<NowPlayingPayload> {
  try {
    const response = await fetch("/api/now-playing");
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = (await response.json()) as Partial<NowPlayingPayload>;
    return {
      ...defaultState,
      ...data
    };
  } catch (error) {
    console.error("Failed to load now playing metadata", error);
    return defaultState;
  }
}

export const NowPlayingProvider = ({
  children,
  intervalMs = 15000
}: {
  children: React.ReactNode;
  intervalMs?: number;
}) => {
  const [nowPlaying, setNowPlaying] =
    useState<NowPlayingPayload>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    const payload = await fetchNowPlaying();
    setNowPlaying(payload);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void handleRefresh();
    const timer = window.setInterval(() => {
      void handleRefresh();
    }, intervalMs);
    return () => {
      window.clearInterval(timer);
    };
  }, [handleRefresh, intervalMs]);

  const value = useMemo(
    () => ({
      nowPlaying,
      isLoading,
      refresh: handleRefresh
    }),
    [nowPlaying, isLoading, handleRefresh]
  );

  return (
    <NowPlayingContext.Provider value={value}>
      {children}
    </NowPlayingContext.Provider>
  );
};

export function useNowPlaying(): NowPlayingContextValue {
  const context = useContext(NowPlayingContext);
  if (!context) {
    throw new Error(
      "useNowPlaying must be used within a NowPlayingProvider component"
    );
  }
  return context;
}
