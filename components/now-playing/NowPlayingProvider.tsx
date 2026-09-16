"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { isUnknownTrackText } from "@/lib/utils";

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

type AzuraCastSong = {
  text?: string;
  artist?: string;
  title?: string;
  art?: string;
};

type AzuraCastResponse = {
  now_playing?: {
    song?: AzuraCastSong;
    elapsed?: number;
    duration?: number;
  };
  listeners?: number | { total?: number; current?: number };
  live?: {
    is_live?: boolean;
  };
  song_history?: Array<{
    song?: AzuraCastSong;
  }>;
};

const AZURACAST_NOW_PLAYING_URL =
  "https://radio.cast.click/api/nowplaying/radioapex";

const defaultState: NowPlayingPayload = {
  title: "",
  artist: "",
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

function normalizeTrackText(value?: string) {
  return removeTurkishCharacters((value || "").replace(/\s+/g, " ").trim());
}

function normalizeAzuraSong(song?: AzuraCastSong): SongHistoryItem {
  const text = normalizeTrackText(
    song?.text || [song?.artist, song?.title].filter(Boolean).join(" - ")
  );
  const [fallbackArtist = "", ...fallbackTitleParts] = text.split(" - ");
  const fallbackTitle = fallbackTitleParts.join(" - ");

  const rawTitle = song?.title || fallbackTitle || text;
  const rawArtist = song?.artist || fallbackArtist;

  return {
    title: isUnknownTrackText(rawTitle) ? "" : normalizeTrackText(rawTitle),
    artist: isUnknownTrackText(rawArtist) ? "" : normalizeTrackText(rawArtist)
  };
}

function parseAzuraNowPlaying(data: AzuraCastResponse): NowPlayingPayload {
  const current = normalizeAzuraSong(data.now_playing?.song);
  const listeners = data.listeners;
  const listenerCount =
    typeof listeners === "number"
      ? listeners
      : listeners?.total ?? listeners?.current ?? 0;

  return {
    ...defaultState,
    title: current.title || defaultState.title,
    artist: current.artist || defaultState.artist,
    isLive: Boolean(data.live?.is_live),
    coverArt: data.now_playing?.song?.art || null,
    elapsed: data.now_playing?.elapsed || 0,
    duration: data.now_playing?.duration || 0,
    listeners: listenerCount,
    songHistory:
      data.song_history
        ?.slice(0, 5)
        .map((item) => normalizeAzuraSong(item.song))
        .filter((song) => Boolean(song.title)) ?? []
  };
}

async function fetchNowPlaying(): Promise<NowPlayingPayload> {
  try {
    const response = await fetch("/api/now-playing");
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = (await response.json()) as Partial<NowPlayingPayload>;
    
    // Türkçe karakterleri kaldır ve unknown kontrolü yap
    const rawTitle = data.title ? removeTurkishCharacters(data.title) : "";
    const rawArtist = data.artist ? removeTurkishCharacters(data.artist) : "";

    const normalizedData = {
      ...data,
      title: isUnknownTrackText(rawTitle) ? "" : rawTitle.trim(),
      artist: isUnknownTrackText(rawArtist) ? "" : rawArtist.trim(),
      songHistory: (data.songHistory || [])
        .map(song => ({
          title: isUnknownTrackText(song.title) ? "" : removeTurkishCharacters(song.title).trim(),
          artist: isUnknownTrackText(song.artist) ? "" : removeTurkishCharacters(song.artist).trim()
        }))
        .filter(song => Boolean(song.title))
    };
    
    return {
      ...defaultState,
      ...normalizedData
    };
  } catch (error) {
    console.error("Failed to load now playing metadata", error);
  }

  try {
    const fallbackResponse = await fetch(AZURACAST_NOW_PLAYING_URL);
    if (!fallbackResponse.ok) {
      throw new Error(`Fallback request failed: ${fallbackResponse.status}`);
    }

    return parseAzuraNowPlaying((await fallbackResponse.json()) as AzuraCastResponse);
  } catch (error) {
    console.error("Failed to load fallback now playing metadata", error);
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleRefresh = useCallback(async () => {
    // Sadece ilk yüklemede loading göster
    if (isInitialLoad) {
      setIsLoading(true);
    }
    
    const payload = await fetchNowPlaying();
    setNowPlaying(payload);
    
    // Sadece ilk yüklemede loading'i kapat
    if (isInitialLoad) {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

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
