import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  type DocumentData,
  type QuerySnapshot
} from "firebase/firestore";
import { getFirestoreInstance } from "@/lib/firebase/client";

export type DJProfile = {
  id: string;
  nickname: string;
  fullName: string;
  city: string;
  photoUrl: string;
  description?: string;
  socials?: {
    instagram?: string;
    soundcloud?: string;
    mixcloud?: string;
  };
};

export type LineupSlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  genre: string;
  title: string;
  djId?: string;
};

const sampleDjs: DJProfile[] = [
  {
    id: "sample-aurora",
    nickname: "Aurora",
    fullName: "Ayşe K.",
    city: "İstanbul",
    photoUrl: "",
    description:
      "Organik house ile analog synthlerin sonsuz birleşimini sahneye taşıyan Aurora'nın setleri dinleyenleri gece yolculuğuna çıkarıyor."
  },
  {
    id: "sample-orbit",
    nickname: "Orbit",
    fullName: "Mehmet Y.",
    city: "İzmir",
    photoUrl: "",
    description:
      "Orbit, minimal techno ve break beat'i cesurca harmanlayarak Radio Apex gecelerine dinamizm katıyor."
  },
  {
    id: "sample-lumen",
    nickname: "Lumen",
    fullName: "Ece S.",
    city: "Berlin",
    photoUrl: "",
    description:
      "Karanlık disco ritimleri ve synth wave dokunuşlarıyla Lumen, gecenin atmosferine yeni bir boyut ekliyor."
  },
  {
    id: "sample-vertex",
    nickname: "Vertex",
    fullName: "Can D.",
    city: "Amsterdam",
    photoUrl: "",
    description:
      "Progressive house ve melodic techno'yu avangard soundscape'lerle harmanlayan Vertex, dinleyicileri derin bir sonic yolculuğa çıkarıyor."
  },
  {
    id: "sample-nova",
    nickname: "Nova",
    fullName: "Elif M.",
    city: "Ankara",
    photoUrl: "",
    description:
      "Ambient textures ve downtempo ritimlerle gecenin sessiz anlarına dokunuş yapan Nova, elektronik müziğin meditatif yönünü keşfediyor."
  },
  {
    id: "sample-pulse",
    nickname: "Pulse",
    fullName: "Serkan T.",
    city: "London",
    photoUrl: "",
    description:
      "Energetik techno ve industrial soundların ustası Pulse, yüksek BPM'lerle dolu setleriyle dansçıları zaman algısından koparıyor."
  }
];

const sampleLineup: LineupSlot[] = [
  {
    id: "slot-01",
    day: "Monday",
    startTime: "20:00",
    endTime: "22:00",
    genre: "Organic House",
    title: "Moonlit Frequencies",
    djId: "sample-aurora"
  },
  {
    id: "slot-02",
    day: "Wednesday",
    startTime: "22:00",
    endTime: "00:00",
    genre: "Minimal Techno",
    title: "Orbital Sequences",
    djId: "sample-orbit"
  },
  {
    id: "slot-03",
    day: "Friday",
    startTime: "23:00",
    endTime: "01:00",
    genre: "Dark Disco",
    title: "Neon Echoes",
    djId: "sample-lumen"
  }
];

type FirestoreState<T> = {
  data: T[];
  loading: boolean;
};

type Transformer<T> = (doc: DocumentData) => T;

type FirestoreRestValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  nullValue?: null;
  mapValue?: { fields?: Record<string, FirestoreRestValue> };
  arrayValue?: { values?: FirestoreRestValue[] };
};

type FirestoreRestResponse = {
  documents?: Array<{
    name: string;
    fields?: Record<string, FirestoreRestValue>;
  }>;
};

const publicCollectionRequests = new Map<string, Promise<DocumentData[]>>();

function decodeFirestoreValue(value: FirestoreRestValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if (value.mapValue) return decodeFirestoreFields(value.mapValue.fields);
  if (value.arrayValue) {
    return (value.arrayValue.values ?? []).map(decodeFirestoreValue);
  }
  return undefined;
}

function decodeFirestoreFields(
  fields: Record<string, FirestoreRestValue> = {}
): DocumentData {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
}

function fetchPublicCollection(collectionName: string): Promise<DocumentData[]> {
  const cachedRequest = publicCollectionRequests.get(collectionName);
  if (cachedRequest) return cachedRequest;

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    return Promise.reject(new Error("Firebase public configuration is missing"));
  }

  const endpoint = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodeURIComponent(collectionName)}`
  );
  endpoint.searchParams.set("key", apiKey);

  const request = fetch(endpoint).then(async response => {
    if (!response.ok) {
      throw new Error(`Firestore REST request failed: ${response.status}`);
    }

    const payload = (await response.json()) as FirestoreRestResponse;
    return (payload.documents ?? []).map(document => ({
      id: document.name.split("/").pop() ?? "",
      ...decodeFirestoreFields(document.fields)
    }));
  });

  publicCollectionRequests.set(collectionName, request);
  return request;
}

function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  fallback: T[],
  transformer?: Transformer<T>,
  realtime = true
): FirestoreState<T> {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const applyDocuments = (documents: DocumentData[]) => {
      if (cancelled) return;

      if (documents.length === 0) {
        setData(fallback);
        setLoading(false);
        return;
      }

      const parsed = documents.map(document =>
        transformer ? transformer(document) : (document as T)
      );
      setData(parsed);
      setLoading(false);
    };

    const handleError = (error: unknown) => {
      if (cancelled) return;
      console.error(`Failed to load ${collectionName}`, error);
      setData(fallback);
      setLoading(false);
    };

    if (!realtime) {
      void fetchPublicCollection(collectionName)
        .then(applyDocuments)
        .catch(handleError);
      return () => {
        cancelled = true;
      };
    }

    const db = getFirestoreInstance();
    if (!db) {
      setLoading(false);
      setData(fallback);
      return;
    }

    const collectionRef = collection(db, collectionName);

    const applySnapshot = (snapshot: QuerySnapshot<DocumentData>) => {
      if (cancelled) return;

      if (snapshot.empty) {
        setData(fallback);
        setLoading(false);
        return;
      }

      const parsed = snapshot.docs.map(doc =>
        transformer
          ? transformer({ id: doc.id, ...doc.data() })
          : ({ id: doc.id, ...doc.data() } as T)
      );
      setData(parsed);
      setLoading(false);
    };

    const unsubscribe = onSnapshot(collectionRef, applySnapshot, handleError);
    return () => {
      cancelled = true;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, realtime]);

  return useMemo(
    () => ({
      data,
      loading
    }),
    [data, loading]
  );
}

const transformDjDoc: Transformer<DJProfile> = doc => ({
    id: doc.id,
    nickname: doc.nickname ?? "Yeni DJ",
    fullName: doc.fullName ?? "",
    city: doc.city ?? "",
    photoUrl: doc.photoUrl ?? "",
    description: doc.description ?? "",
    socials: doc.socials ?? {}
  });

const transformLineupDoc: Transformer<LineupSlot> = doc => ({
  id: doc.id,
  day: doc.day ?? "",
  startTime: doc.startTime ?? "",
  endTime: doc.endTime ?? "",
  genre: doc.genre ?? "",
  title: doc.title ?? "",
  djId: doc.djId ?? ""
});

function sortDjsAlphabetically(djs: DJProfile[]): DJProfile[] {
  return [...djs].sort((a, b) =>
    (a.nickname || a.fullName).localeCompare(b.nickname || b.fullName, "tr", {
      sensitivity: "base"
    })
  );
}

const DAY_ORDER: Record<string, number> = {
  monday: 1,
  pazartesi: 1,
  tuesday: 2,
  sali: 2,
  salı: 2,
  wednesday: 3,
  carsamba: 3,
  çarşamba: 3,
  thursday: 4,
  persembe: 4,
  perşembe: 4,
  friday: 5,
  cuma: 5,
  saturday: 6,
  cumartesi: 6,
  sunday: 7,
  pazar: 7
};

function getDayOrder(day: string): number {
  return DAY_ORDER[day.trim().toLowerCase()] ?? 999;
}

// Times before 06:00 are after-midnight slots and sort at the end of the day.
const LATE_NIGHT_CUTOFF_HOUR = 6;

function timeToSortMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(part => parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 9999;
  let total = hours * 60 + minutes;
  if (hours < LATE_NIGHT_CUTOFF_HOUR) {
    total += 24 * 60;
  }
  return total;
}

function sortLineupByDayAndTime(lineup: LineupSlot[]): LineupSlot[] {
  return [...lineup].sort((a, b) => {
    const dayDiff = getDayOrder(a.day) - getDayOrder(b.day);
    if (dayDiff !== 0) return dayDiff;
    return timeToSortMinutes(a.startTime) - timeToSortMinutes(b.startTime);
  });
}

export function useDJs({ realtime = true }: { realtime?: boolean } = {}): FirestoreState<DJProfile> {
  const state = useFirestoreCollection<DJProfile>(
    "djs",
    sampleDjs,
    transformDjDoc,
    realtime
  );
  return useMemo(
    () => ({
      ...state,
      data: sortDjsAlphabetically(state.data)
    }),
    [state.data, state.loading]
  );
}

export function useLineup({ realtime = true }: { realtime?: boolean } = {}): FirestoreState<LineupSlot> {
  const state = useFirestoreCollection<LineupSlot>(
    "lineup",
    sampleLineup,
    transformLineupDoc,
    realtime
  );
  return useMemo(
    () => ({
      ...state,
      data: sortLineupByDayAndTime(state.data)
    }),
    [state.data, state.loading]
  );
}
