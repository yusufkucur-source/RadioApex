import { NextResponse } from "next/server";

// AzuraCast API endpoint - eski HTML'den
const AZURACAST_API = "https://radio.cast.click/api/nowplaying/radioapex";

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

export async function GET() {
  try {
    const response = await fetch(AZURACAST_API, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const data = (await response.json()) as AzuraCastResponse;

    // Şarkı bilgilerini parse et (eski HTML mantığı)
    const song = data?.now_playing?.song || {};
    const text = song.text || [song.artist, song.title].filter(Boolean).join(' - ');
    const title = song.title || (text && text.split(' - ')[1]) || text || 'Radio Apex Live';
    const artist = song.artist || (text && text.split(' - ')[0]) || '';

    // Dinleyici sayısı
    const listeners = data?.listeners;
    const listenerCount = typeof listeners === 'number' 
      ? listeners 
      : (listeners?.total ?? listeners?.current ?? 0);

    // Canlı yayın durumu
    const isLive = !!(data?.live?.is_live);

    const payload = {
      title: title.trim() || "Radio Apex Live",
      artist: artist.trim() || "",
      isLive,
      coverArt: song.art || null,
      elapsed: data?.now_playing?.elapsed || 0,
      duration: data?.now_playing?.duration || 0,
      listeners: listenerCount,
      songHistory: (data?.song_history || []).slice(0, 5).map(item => {
        const s = item?.song || {};
        const t = s.text || [s.artist, s.title].filter(Boolean).join(' - ');
        return {
          title: s.title || t.split(' - ')[1] || t || 'Unknown',
          artist: s.artist || t.split(' - ')[0] || '',
        };
      })
    };

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Now playing API error", error);
    return NextResponse.json(
      {
        title: "Radio Apex Live",
        artist: "",
        isLive: true,
        coverArt: null,
        elapsed: 0,
        duration: 0,
        listeners: 0,
        songHistory: []
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        },
        status: 200
      }
    );
  }
}
