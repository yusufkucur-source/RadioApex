import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, type DocumentData } from "firebase/firestore";
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
  }
];

const sampleLineup: LineupSlot[] = [
  {
    id: "slot-01",
    day: "Pazartesi",
    startTime: "20:00",
    endTime: "22:00",
    genre: "Organic House",
    title: "Moonlit Frequencies",
    djId: "sample-aurora"
  },
  {
    id: "slot-02",
    day: "Çarşamba",
    startTime: "22:00",
    endTime: "00:00",
    genre: "Minimal Techno",
    title: "Orbital Sequences",
    djId: "sample-orbit"
  },
  {
    id: "slot-03",
    day: "Cuma",
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

function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  fallback: T[],
  transformer?: Transformer<T>
): FirestoreState<T> {
  const [data, setData] = useState<T[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestoreInstance();
    if (!db) {
      setLoading(false);
      setData(fallback);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      snapshot => {
        const parsed = snapshot.docs.map(doc =>
          transformer ? transformer({ id: doc.id, ...doc.data() }) : ({ id: doc.id, ...doc.data() } as T)
        );
        setData(parsed);
        setLoading(false);
      },
      error => {
        console.error(`Failed to load ${collectionName}`, error);
        setData(fallback);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, transformer]);

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

export function useDJs(): FirestoreState<DJProfile> {
  return useFirestoreCollection<DJProfile>("djs", sampleDjs, transformDjDoc);
}

export function useLineup(): FirestoreState<LineupSlot> {
  return useFirestoreCollection<LineupSlot>(
    "lineup",
    sampleLineup,
    transformLineupDoc
  );
}
