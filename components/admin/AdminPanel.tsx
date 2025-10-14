"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import clsx from "clsx";
import { getFirebaseApp, getFirebaseAuthInstance, getFirestoreInstance } from "@/lib/firebase/client";
import { useDJs, useLineup, type DJProfile, type LineupSlot } from "@/lib/firebase/hooks";

type DjForm = {
  nickname: string;
  fullName: string;
  city: string;
  photoUrl: string;
  description: string;
};

type LineupForm = {
  day: string;
  startTime: string;
  endTime: string;
  title: string;
  genre: string;
  djId: string;
};

const initialDjForm: DjForm = {
  nickname: "",
  fullName: "",
  city: "",
  photoUrl: "",
  description: ""
};

const initialLineupForm: LineupForm = {
  day: "",
  startTime: "",
  endTime: "",
  title: "",
  genre: "",
  djId: ""
};

function useFirebaseAvailability() {
  const [ready, setReady] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const app = getFirebaseApp();
    if (!app) {
      setAvailable(false);
      return;
    }
    setReady(true);
  }, []);

  return { ready, available };
}

export default function AdminPanel() {
  const { ready, available } = useFirebaseAvailability();
  const auth = getFirebaseAuthInstance();
  const db = getFirestoreInstance();
  const { data: djs } = useDJs();
  const { data: lineup } = useLineup();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [djForm, setDjForm] = useState<DjForm>(initialDjForm);
  const [lineupForm, setLineupForm] = useState<LineupForm>(initialLineupForm);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, current => {
      setUser(current);
    });
    return () => unsub();
  }, [auth]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) return;
    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      form.reset();
    } catch (err) {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const handleDjSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db) {
      setError("Firestore yapılandırması yok. .env dosyasını güncelleyin.");
      return;
    }
    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "djs"), {
        ...djForm,
        createdAt: serverTimestamp()
      });
      setDjForm(initialDjForm);
    } catch (err) {
      console.error(err);
      setError("DJ kaydı eklenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLineupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db) {
      setError("Firestore yapılandırması yok. .env dosyasını güncelleyin.");
      return;
    }
    try {
      setIsSubmitting(true);
      await addDoc(collection(db, "lineup"), {
        ...lineupForm,
        createdAt: serverTimestamp()
      });
      setLineupForm(initialLineupForm);
    } catch (err) {
      console.error(err);
      setError("Yayın akışı eklenirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, collectionName, id));
  };

  const handleSetFeatured = async (slot: LineupSlot) => {
    if (!db) return;
    await updateDoc(doc(db, "lineup", slot.id), {
      featured: !(slot as { featured?: boolean }).featured ?? false
    });
  };

  const djOptions = useMemo(
    () => djs.map(dj => ({ label: dj.nickname, value: dj.id })),
    [djs]
  );

  if (!available) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-red-500/10 p-8 text-center text-white/80">
        <h2 className="text-xl font-semibold text-white">
          Firebase yapılandırması eksik
        </h2>
        <p className="mt-4 text-sm text-white/70">
          Admin panelinin çalışması için `.env.local` dosyanıza Firebase
          konfigürasyon anahtarlarını ekleyin ve uygulamayı yeniden başlatın.
        </p>
        <code className="mt-6 block rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-left text-xs text-white/60">
          NEXT_PUBLIC_FIREBASE_API_KEY=…{"\n"}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=…{"\n"}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID=…{"\n"}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=…{"\n"}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=…{"\n"}
          NEXT_PUBLIC_FIREBASE_APP_ID=…{"\n"}
        </code>
      </div>
    );
  }

  if (!ready || !auth) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-white/70">
        Firebase başlatılıyor...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-2xl">
        <h2 className="text-2xl font-semibold text-white">Admin Girişi</h2>
        <p className="mt-2 text-sm text-white/60">
          Yönetici paneline erişmek için kayıtlı Firebase hesabınızla giriş
          yapın.
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-xs uppercase tracking-[0.3em] text-white/60">
              E-posta
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@radioapex.com"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-accent focus:bg-black/60"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-xs uppercase tracking-[0.3em] text-white/60">
              Şifre
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="•••••••"
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-accent focus:bg-black/60"
            />
          </div>
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-xs text-red-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-apex-accent via-apex-accent/80 to-apex-secondary/80 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12">
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-2xl md:flex-row md:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">
            Hoş geldin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {user.email}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-apex-accent hover:text-apex-accent"
        >
          Çıkış
        </button>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <section className="grid gap-10 lg:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-2xl">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">DJ Yönetimi</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                DJ ekle / düzenle
              </p>
            </div>
          </header>
          <form onSubmit={handleDjSubmit} className="mt-6 space-y-4">
            {(
              Object.keys(initialDjForm) as Array<keyof typeof initialDjForm>
            ).map(key => (
              <div key={key} className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                  {key === "fullName"
                    ? "İsim Soyisim"
                    : key === "photoUrl"
                    ? "Fotoğraf URL"
                    : key === "description"
                    ? "Açıklama"
                    : key === "nickname"
                    ? "DJ Nickname"
                    : "Şehir"}
                </label>
                {key === "description" ? (
                  <textarea
                    value={djForm[key]}
                    onChange={event =>
                      setDjForm(prev => ({
                        ...prev,
                        [key]: event.target.value
                      }))
                    }
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-apex-accent focus:bg-black/60"
                  />
                ) : (
                  <input
                    value={djForm[key]}
                    onChange={event =>
                      setDjForm(prev => ({
                        ...prev,
                        [key]: event.target.value
                      }))
                    }
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-accent focus:bg-black/60"
                  />
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-apex-accent via-apex-accent/80 to-apex-secondary/80 text-xs font-semibold uppercase tracking-[0.35em] text-white transition disabled:opacity-70"
            >
              DJ Kaydet
            </button>
          </form>

          <div className="mt-8 space-y-4">
            {djs.map(dj => (
              <div
                key={dj.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {dj.nickname}
                  </p>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                    {dj.city}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete("djs", dj.id)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-red-400/60 hover:text-red-200"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-2xl">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Line Up Yönetimi
              </h2>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Yayın takvimi
              </p>
            </div>
          </header>
          <form onSubmit={handleLineupSubmit} className="mt-6 space-y-4">
            {(
              Object.keys(initialLineupForm) as Array<
                keyof typeof initialLineupForm
              >
            ).map(key => {
              if (key === "djId") {
                return (
                  <div key={key} className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                      DJ
                    </label>
                    <select
                      value={lineupForm.djId}
                      onChange={event =>
                        setLineupForm(prev => ({
                          ...prev,
                          djId: event.target.value
                        }))
                      }
                      className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-secondary focus:bg-black/60"
                    >
                      <option value="">DJ Seçin</option>
                      {djOptions.map(option => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-black text-white"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              const label =
                key === "day"
                  ? "Gün"
                  : key === "startTime"
                  ? "Başlangıç"
                  : key === "endTime"
                  ? "Bitiş"
                  : key === "title"
                  ? "Yayın Başlığı"
                  : "Tür";

              return (
                <div key={key} className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    {label}
                  </label>
                  <input
                    value={lineupForm[key]}
                    onChange={event =>
                      setLineupForm(prev => ({
                        ...prev,
                        [key]: event.target.value
                      }))
                    }
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-secondary focus:bg-black/60"
                  />
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-apex-secondary via-apex-accent/80 to-apex-accent text-xs font-semibold uppercase tracking-[0.35em] text-white transition disabled:opacity-70"
            >
              Line Up Kaydet
            </button>
          </form>

          <div className="mt-8 space-y-4">
            {lineup.map(slot => (
              <div
                key={slot.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {slot.title}
                  </p>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                    {slot.day} • {slot.startTime} — {slot.endTime}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSetFeatured(slot)}
                    className={clsx(
                      "rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] transition",
                      (slot as { featured?: boolean }).featured
                        ? "border-apex-accent/70 text-apex-accent"
                        : "border-white/10 text-white/60 hover:border-apex-accent/50 hover:text-apex-accent"
                    )}
                  >
                    {((slot as { featured?: boolean }).featured ?? false)
                      ? "Öne çıkarıldı"
                      : "Öne çıkar"}
                  </button>
                  <button
                    onClick={() => handleDelete("lineup", slot.id)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-red-400/60 hover:text-red-200"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
