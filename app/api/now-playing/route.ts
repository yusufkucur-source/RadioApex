import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { cleanTrackText, isUnknownTrackText } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// AzuraCast API endpoint - eski HTML'den
const AZURACAST_API = "https://radio.cast.click/api/nowplaying/radioapex";
// This is the same shared history that the mobile app reads.
const HISTORY_COLLECTION = "recentTracks";
const HISTORY_STATE_COLLECTION = "metadata";
const HISTORY_STATE_DOCUMENT = "recentTracksState";
const HISTORY_LIMIT = 5;
const MEMORY_HISTORY_LIMIT = 50;
const API_RESPONSE_CACHE_MS = 12000;
const HISTORY_RESOLUTION_TIMEOUT_MS = 2500;

let firebaseApp: App | null = null;
let firestoreDb: Firestore | null = null;
let cachedPayload: NowPlayingPayload | null = null;
let cachedPayloadAt = 0;
let memoryHistory: CurrentTrack[] = [];

type AzuraCastSong = {
  text?: string;
  artist?: string;
  title?: string;
  art?: string;
};

type AzuraCastResponse = {
  now_playing?: {
    song?: AzuraCastSong;
    played_at?: number;
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

type SongHistoryItem = {
  title: string;
  artist: string;
};

type CurrentTrack = SongHistoryItem & {
  coverArt: string | null;
  playedAt: number;
  trackKey: string;
};

type NowPlayingPayload = {
  title: string;
  artist: string;
  isLive: boolean;
  coverArt: string | null;
  elapsed: number;
  duration: number;
  listeners: number;
  songHistory: SongHistoryItem[];
};

function getFirebasePrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function getFirestoreInstance(): Firestore | null {
  if (firestoreDb) {
    return firestoreDb;
  }

  try {
    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
      firestoreDb = getFirestore(firebaseApp);
      return firestoreDb;
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      firebaseApp = initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
      });
      firestoreDb = getFirestore(firebaseApp);
      return firestoreDb;
    }

    const projectId =
      process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = getFirebasePrivateKey();

    if (!projectId || !clientEmail || !privateKey) {
      return null;
    }

    firebaseApp = initializeApp({
      credential: cert({
        clientEmail,
        privateKey,
        projectId
      })
    });
    firestoreDb = getFirestore(firebaseApp);
    return firestoreDb;
  } catch (error) {
    console.warn("Firebase Admin could not be initialized", error);
    return null;
  }
}

function normalizeTrackText(value?: string) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function normalizeSong(song?: AzuraCastSong): SongHistoryItem {
  const text = cleanTrackText(
    song?.text || [song?.artist, song?.title].filter(Boolean).join(" - ")
  );
  const [fallbackArtist = "", ...fallbackTitleParts] = text.split(" - ");
  const fallbackTitle = fallbackTitleParts.join(" - ");

  const rawTitle = song?.title || fallbackTitle || text;
  const rawArtist = song?.artist || fallbackArtist;

  return {
    title: cleanTrackText(rawTitle),
    artist: cleanTrackText(rawArtist)
  };
}

function getTrackKey(track: SongHistoryItem) {
  const normalized = `${track.artist} - ${track.title}`.toLowerCase();
  return createHash("sha1").update(normalized).digest("hex");
}

function isRecordableTrack(track: SongHistoryItem) {
  const title = track.title.toLowerCase();
  const artist = track.artist.toLowerCase();

  return Boolean(
    track.title &&
      !isUnknownTrackText(track.title) &&
      !isUnknownTrackText(track.artist) &&
      title !== "radio apex live" &&
      !(title === "radio apex" && artist === "radio apex")
  );
}

function getExternalSongHistory(data: AzuraCastResponse): SongHistoryItem[] {
  return (data?.song_history || [])
    .slice(0, HISTORY_LIMIT)
    .map((item) => normalizeSong(item?.song))
    .filter(isRecordableTrack);
}

async function pruneTrackHistory(db: Firestore) {
  const snapshot = await db
    .collection(HISTORY_COLLECTION)
    .orderBy("playedAt", "desc")
    .limit(75)
    .get();

  await Promise.all(snapshot.docs.slice(50).map((item) => item.ref.delete()));
}

async function syncTrackHistory(db: Firestore, currentTrack: CurrentTrack) {
  const stateRef = db.collection(HISTORY_STATE_COLLECTION).doc(HISTORY_STATE_DOCUMENT);
  const entryRef = db
    .collection(HISTORY_COLLECTION)
    .doc(`${currentTrack.playedAt}-${currentTrack.trackKey.slice(0, 12)}`);

  await db.runTransaction(async (transaction) => {
    const stateSnapshot = await transaction.get(stateRef);
    if (stateSnapshot.data()?.lastSignature === currentTrack.trackKey) return;

    transaction.set(entryRef, {
      artist: currentTrack.artist,
      coverArt: currentTrack.coverArt,
      playedAt: currentTrack.playedAt,
      signature: currentTrack.trackKey,
      text: `${currentTrack.artist} - ${currentTrack.title}`,
      title: currentTrack.title,
      trackKey: currentTrack.trackKey
    });
    transaction.set(
      stateRef,
      {
        lastSignature: currentTrack.trackKey,
        lastTrack: {
          artist: currentTrack.artist,
          coverArt: currentTrack.coverArt,
          playedAt: currentTrack.playedAt,
          title: currentTrack.title
        },
        updatedAt: Date.now()
      },
      { merge: true }
    );
  });

  await pruneTrackHistory(db);
}

async function getStoredSongHistory(
  db: Firestore,
  currentTrackKey: string
): Promise<SongHistoryItem[]> {
  const snapshot = await db
    .collection(HISTORY_COLLECTION)
    .orderBy("playedAt", "desc")
    .limit(12)
    .get();

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      return {
        artist: normalizeTrackText(
          typeof data.artist === "string" ? data.artist : ""
        ),
        title: normalizeTrackText(typeof data.title === "string" ? data.title : ""),
        trackKey:
          typeof data.trackKey === "string"
            ? data.trackKey
            : getTrackKey({
                artist: normalizeTrackText(typeof data.artist === "string" ? data.artist : ""),
                title: normalizeTrackText(typeof data.title === "string" ? data.title : "")
              })
      };
    })
    .filter(
      (item) =>
        item.trackKey !== currentTrackKey &&
        isRecordableTrack({ artist: item.artist, title: item.title })
    )
    .slice(0, HISTORY_LIMIT)
    .map(({ artist, title }) => ({ artist, title }));
}

function syncMemoryTrackHistory(currentTrack: CurrentTrack) {
  if (!isRecordableTrack(currentTrack)) {
    return;
  }

  if (memoryHistory[0]?.trackKey === currentTrack.trackKey) {
    return;
  }

  memoryHistory = [
    currentTrack,
    ...memoryHistory.filter((item) => item.trackKey !== currentTrack.trackKey)
  ].slice(0, MEMORY_HISTORY_LIMIT);
}

function getMemorySongHistory(currentTrackKey: string): SongHistoryItem[] {
  return memoryHistory
    .filter((item) => item.trackKey !== currentTrackKey)
    .slice(0, HISTORY_LIMIT)
    .map(({ artist, title }) => ({ artist, title }));
}

async function resolveSongHistory(
  currentTrack: CurrentTrack,
  externalHistory: SongHistoryItem[]
) {
  const db = getFirestoreInstance();

  if (!isRecordableTrack(currentTrack)) {
    return externalHistory;
  }

  if (!db) {
    syncMemoryTrackHistory(currentTrack);
    const memorySongHistory = getMemorySongHistory(currentTrack.trackKey);
    return memorySongHistory.length > 0 ? memorySongHistory : externalHistory;
  }

  try {
    await syncTrackHistory(db, currentTrack);
    const storedHistory = await getStoredSongHistory(db, currentTrack.trackKey);
    return storedHistory.length > 0 ? storedHistory : externalHistory;
  } catch (error) {
    console.warn("Track history persistence failed", error);
    syncMemoryTrackHistory(currentTrack);
    const memorySongHistory = getMemorySongHistory(currentTrack.trackKey);
    return memorySongHistory.length > 0 ? memorySongHistory : externalHistory;
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    })
  ]);
}

export async function GET() {
  try {
    if (cachedPayload && Date.now() - cachedPayloadAt < API_RESPONSE_CACHE_MS) {
      return NextResponse.json(cachedPayload, {
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      });
    }

    const response = await fetch(AZURACAST_API, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const data = (await response.json()) as AzuraCastResponse;

    // Şarkı bilgilerini parse et (eski HTML mantığı)
    const song = data?.now_playing?.song || {};
    const currentSong = normalizeSong(song);
    const title = cleanTrackText(currentSong.title);
    const artist = cleanTrackText(currentSong.artist);
    const currentTrack: CurrentTrack = {
      artist,
      coverArt: song.art || null,
      playedAt:
        typeof data.now_playing?.played_at === "number"
          ? data.now_playing.played_at
          : Math.floor(Date.now() / 1000),
      title,
      trackKey: getTrackKey({ artist, title })
    };

    // Dinleyici sayısı
    const listeners = data?.listeners;
    const listenerCount = typeof listeners === 'number' 
      ? listeners 
      : (listeners?.total ?? listeners?.current ?? 0);

    // Canlı yayın durumu
    const isLive = !!(data?.live?.is_live);
    const externalHistory = getExternalSongHistory(data);
    let songHistory = externalHistory;

    try {
      songHistory = await withTimeout(
        resolveSongHistory(currentTrack, externalHistory),
        HISTORY_RESOLUTION_TIMEOUT_MS,
        "Track history resolution timed out"
      );
    } catch (error) {
      console.warn("Track history resolution failed", error);
    }

    const payload: NowPlayingPayload = {
      title: title.trim(),
      artist: artist.trim(),
      isLive,
      coverArt: song.art || null,
      elapsed: data?.now_playing?.elapsed || 0,
      duration: data?.now_playing?.duration || 0,
      listeners: listenerCount,
      songHistory
    };

    cachedPayload = payload;
    cachedPayloadAt = Date.now();

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Now playing API error", error);
    return NextResponse.json(
      {
        title: "",
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
