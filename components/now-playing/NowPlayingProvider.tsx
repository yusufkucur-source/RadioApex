"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

export type SongHistoryItem = {
  title: string;
  artist: string;
};

export type NowPlayingPayload = {
  title: string;
  artist: string;
  isLive: boolean;
  coverArt: string | null;
  elapsed: number;
  duration: number;
  listeners: number;
  songHistory: SongHistoryItem[];
};

type NowPlayingContextValue = {
  nowPlaying: NowPlayingPayload;
  isLoading: boolean;
  refresh: () => void;
};

const defaultState: NowPlayingPayload = {
  title: "",
  artist: "RADIO APEX",
  isLive: true,
  coverArt: null,
  elapsed: 0,
  duration: 0,
  listeners: 0,
  songHistory: []
};

const NowPlayingContext = createContext<NowPlayingContextValue | undefined>(
  undefined
);

// Türkçe karakterleri İngilizce karakterlere dönüştür
function removeTurkishCharacters(text: string): string {
  const charMap: { [key: string]: string } = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };
  
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, (char) => charMap[char] || char);
}

async function fetchNowPlaying(): Promise<NowPlayingPayload> {
  try {
    const response = await fetch("/api/now-playing");
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = (await response.json()) as Partial<NowPlayingPayload>;
    
    // Türkçe karakterleri kaldır
    const normalizedData = {
      ...data,
      title: data.title ? removeTurkishCharacters(data.title) : defaultState.title,
      artist: data.artist ? removeTurkishCharacters(data.artist) : defaultState.artist,
      songHistory: data.songHistory?.map(song => ({
        title: removeTurkishCharacters(song.title),
        artist: removeTurkishCharacters(song.artist)
      })) || []
    };
    
    return {
      ...defaultState,
      ...normalizedData
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
