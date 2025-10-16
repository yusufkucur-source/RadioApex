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
import { seedDatabaseWithSampleData } from "@/lib/firebase/seedData";

type NavSection = "overview" | "djs" | "lineup";

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
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const [editingDjId, setEditingDjId] = useState<string | null>(null);
  const [editingLineupId, setEditingLineupId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      setError("Login failed. Please check your credentials.");
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
      setIsSubmitting(false);
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    
    try {
      if (editingDjId) {
        // Güncelleme modu
        console.log("Updating DJ:", editingDjId, djForm);
        await updateDoc(doc(db, "djs", editingDjId), {
          ...djForm,
          updatedAt: serverTimestamp()
        });
        setSuccessMessage("✅ DJ başarıyla güncellendi!");
        setEditingDjId(null);
      } else {
        // Yeni ekleme modu
        console.log("Adding new DJ:", djForm);
      await addDoc(collection(db, "djs"), {
        ...djForm,
        createdAt: serverTimestamp()
      });
        setSuccessMessage("✅ Yeni DJ başarıyla eklendi!");
      }
      
      setDjForm(initialDjForm);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("DJ kaydetme hatası:", err);
      setError(editingDjId 
        ? `DJ güncellenirken hata oluştu: ${err instanceof Error ? err.message : "Bilinmeyen hata"}` 
        : `DJ kaydı eklenirken hata oluştu: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDj = (dj: DJProfile) => {
    setDjForm({
      nickname: dj.nickname,
      fullName: dj.fullName,
      city: dj.city,
      photoUrl: dj.photoUrl,
      description: dj.description || ""
    });
    setEditingDjId(dj.id);
    setActiveSection("djs");
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEditDj = () => {
    setEditingDjId(null);
    setDjForm(initialDjForm);
  };

  const handleLineupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db) {
      setError("Firestore yapılandırması yok. .env dosyasını güncelleyin.");
      setIsSubmitting(false);
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    
    try {
      if (editingLineupId) {
        // Güncelleme modu
        console.log("Updating Show:", editingLineupId, lineupForm);
        await updateDoc(doc(db, "lineup", editingLineupId), {
          ...lineupForm,
          updatedAt: serverTimestamp()
        });
        setSuccessMessage("✅ Show başarıyla güncellendi!");
        setEditingLineupId(null);
      } else {
        // Yeni ekleme modu
        console.log("Adding new Show:", lineupForm);
      await addDoc(collection(db, "lineup"), {
        ...lineupForm,
        createdAt: serverTimestamp()
      });
        setSuccessMessage("✅ Yeni show başarıyla eklendi!");
      }
      
      setLineupForm(initialLineupForm);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Show kaydetme hatası:", err);
      setError(editingLineupId 
        ? `Show güncellenirken hata oluştu: ${err instanceof Error ? err.message : "Bilinmeyen hata"}` 
        : `Show eklenirken hata oluştu: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLineup = (slot: LineupSlot) => {
    setLineupForm({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      title: slot.title,
      genre: slot.genre,
      djId: slot.djId || ""
    });
    setEditingLineupId(slot.id);
    setActiveSection("lineup");
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEditLineup = () => {
    setEditingLineupId(null);
    setLineupForm(initialLineupForm);
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!db) return;
    try {
    await deleteDoc(doc(db, collectionName, id));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Silme işlemi başarısız oldu.");
    }
  };

  const handleSetFeatured = async (slot: LineupSlot) => {
    if (!db) return;
    try {
    await updateDoc(doc(db, "lineup", slot.id), {
        featured: !((slot as { featured?: boolean }).featured ?? false)
    });
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Öne çıkarma işlemi başarısız oldu.");
    }
  };

  const djOptions = useMemo(
    () => djs.map(dj => ({ label: dj.nickname, value: dj.id })),
    [djs]
  );

  // Sort lineup by day (Monday -> Sunday) and time
  const sortedLineup = useMemo(() => {
    const dayOrder = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7
    };

    return [...lineup].sort((a, b) => {
      // First, sort by day
      const dayA = dayOrder[a.day as keyof typeof dayOrder] || 999;
      const dayB = dayOrder[b.day as keyof typeof dayOrder] || 999;
      
      if (dayA !== dayB) {
        return dayA - dayB;
      }

      // If same day, sort by start time
      const timeA = a.startTime.replace(':', '');
      const timeB = b.startTime.replace(':', '');
      return timeA.localeCompare(timeB);
    });
  }, [lineup]);

  // Otomatik seed - sadece bir kere çalışır
  useEffect(() => {
    const autoSeed = async () => {
      if (!db || !user) return;
      
      // localStorage kontrolü - daha önce seed yapıldı mı?
      const hasSeeded = localStorage.getItem('radioapex_db_seeded');
      if (hasSeeded === 'true') return;

      const result = await seedDatabaseWithSampleData(db);
      if (result.success && (result.djsAdded > 0 || result.lineupAdded > 0)) {
        localStorage.setItem('radioapex_db_seeded', 'true');
      }
    };

    autoSeed();
  }, [db, user]);


  if (!available) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-red-500/10 p-8 text-center text-white/80">
        <h2 className="font-roboto text-xl font-semibold text-white">
          Firebase yapılandırması eksik
        </h2>
        <p className="font-spaceGrotesk mt-4 text-sm text-white/70">
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
        <h2 className="font-roboto text-2xl font-semibold text-white">Admin Login</h2>
        <p className="font-spaceGrotesk mt-2 text-sm text-white/60">
          Sign in with your registered Firebase account to access the admin panel.
        </p>
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-xs uppercase tracking-[0.3em] text-white/60">
              Email
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
              Password
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
            className="flex h-12 w-full items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-apex-accent via-apex-accent/80 to-apex-secondary/80 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:opacity-90"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  // Dashboard with Sidebar
  return (
    <div className="flex min-h-[calc(100vh-12rem)] gap-6">
      {/* Sidebar */}
      <aside className="w-64 shrink-0">
        <div className="sticky top-6 space-y-6">
          {/* User Info */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Logged in as
            </p>
            <p className="mt-2 truncate text-sm font-medium text-white">
            {user.email}
            </p>
        <button
          onClick={handleLogout}
              className="mt-4 w-full rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-red-400/50 hover:text-red-200"
        >
          Logout
        </button>
      </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection("overview")}
              className={clsx(
                "w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                activeSection === "overview"
                  ? "bg-gradient-to-r from-apex-accent/20 to-apex-secondary/20 text-white border border-apex-accent/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveSection("djs")}
              className={clsx(
                "w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                activeSection === "djs"
                  ? "bg-gradient-to-r from-apex-accent/20 to-apex-secondary/20 text-white border border-apex-accent/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              🎧 DJ Management
            </button>
            <button
              onClick={() => setActiveSection("lineup")}
              className={clsx(
                "w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                activeSection === "lineup"
                  ? "bg-gradient-to-r from-apex-accent/20 to-apex-secondary/20 text-white border border-apex-accent/30"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              📅 Lineup Schedule
            </button>
          </nav>

          {/* Stats */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Quick Stats
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Total DJs</span>
                <span className="text-lg font-semibold text-apex-accent">
                  {djs.length}
                </span>
              </div>
               <div className="flex items-center justify-between">
                 <span className="text-xs text-white/60">Shows</span>
                 <span className="text-lg font-semibold text-apex-secondary">
                   {sortedLineup.length}
                 </span>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
      {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            ❌ {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-100">
            {successMessage}
        </div>
      )}


        {/* Overview Section */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
              <h2 className="text-2xl font-semibold text-white">
                Dashboard Overview
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Welcome to Radio Apex admin panel. Manage your DJs and lineup schedule.
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-apex-accent/10 to-apex-accent/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                        Total DJs
                      </p>
                      <p className="mt-2 text-4xl font-bold text-white">
                        {djs.length}
                      </p>
                    </div>
                    <div className="text-5xl">🎧</div>
                  </div>
                  <button
                    onClick={() => setActiveSection("djs")}
                    className="mt-4 text-xs text-apex-accent hover:underline"
                  >
                    Manage DJs →
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-apex-secondary/10 to-apex-secondary/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                       <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                         Scheduled Shows
                       </p>
                       <p className="mt-2 text-4xl font-bold text-white">
                         {sortedLineup.length}
                       </p>
                    </div>
                    <div className="text-5xl">📅</div>
                  </div>
                  <button
                    onClick={() => setActiveSection("lineup")}
                    className="mt-4 text-xs text-apex-secondary hover:underline"
                  >
                    Manage Schedule →
                  </button>
                </div>
              </div>


              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
                  Recent DJs
                </h3>
                <div className="mt-4 space-y-2">
                  {djs.slice(0, 3).map(dj => (
                    <div
                      key={dj.id}
                      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-apex-accent/20 text-lg">
                        🎧
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {dj.nickname}
                        </p>
                        <p className="text-xs text-white/50">{dj.city}</p>
                      </div>
                    </div>
                  ))}
                  {djs.length === 0 && (
                    <p className="py-8 text-center text-sm text-white/40">
                      No DJs added yet. Click &quot;Manage DJs&quot; to add your first DJ.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DJs Section */}
        {activeSection === "djs" && (
          <div className="space-y-6">
            {/* Add/Edit DJ Form */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingDjId ? "Edit DJ" : "Add New DJ"}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    {editingDjId ? "Update DJ Profile" : "Create DJ Profile"}
                  </p>
                </div>
                {editingDjId && (
                  <button
                    onClick={handleCancelEditDj}
                    className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-white/40 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>

          <form onSubmit={handleDjSubmit} className="mt-6 space-y-4">
            {(
              Object.keys(initialDjForm) as Array<keyof typeof initialDjForm>
            ).map(key => (
              <div key={key} className="space-y-2">
                <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                  {key === "fullName"
                    ? "Full Name"
                    : key === "photoUrl"
                    ? "Photo URL"
                    : key === "description"
                    ? "Description"
                    : key === "nickname"
                    ? "DJ Nickname"
                    : "City"}
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
                  className="flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-apex-accent via-apex-accent/80 to-apex-secondary/80 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:opacity-90 disabled:opacity-50"
            >
                  {isSubmitting 
                    ? (editingDjId ? "Updating..." : "Saving...") 
                    : (editingDjId ? "Update DJ" : "Save DJ")}
            </button>
          </form>
            </div>

            {/* DJs List */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
              <h2 className="text-xl font-semibold text-white">All DJs</h2>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                {djs.length} Total
              </p>

              <div className="mt-6 space-y-3">
            {djs.map(dj => (
              <div
                key={dj.id}
                    className={clsx(
                      "flex items-start justify-between gap-4 rounded-2xl border px-5 py-4 transition",
                      editingDjId === dj.id
                        ? "border-apex-accent/50 bg-apex-accent/10"
                        : "border-white/10 bg-black/40 hover:bg-black/60"
                    )}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{dj.nickname}</p>
                      <p className="mt-1 text-xs text-white/60">{dj.fullName}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                    {dj.city}
                  </p>
                </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDj(dj)}
                        className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-apex-accent/60 hover:text-apex-accent"
                      >
                        Edit
                      </button>
                <button
                  onClick={() => handleDelete("djs", dj.id)}
                        className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-red-400/60 hover:text-red-200"
                >
                  Delete
                </button>
                    </div>
              </div>
            ))}
                {djs.length === 0 && (
                  <p className="py-12 text-center text-sm text-white/40">
                    No DJs found. Add your first DJ using the form above.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lineup Section */}
        {activeSection === "lineup" && (
          <div className="space-y-6">
            {/* Add/Edit Lineup Form */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
              <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                    {editingLineupId ? "Edit Show" : "Add Show to Schedule"}
              </h2>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                    {editingLineupId ? "Update Show Details" : "Create New Show"}
              </p>
            </div>
                {editingLineupId && (
                  <button
                    onClick={handleCancelEditLineup}
                    className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-white/40 hover:text-white"
                  >
                    Cancel
                  </button>
                )}
              </div>

          <form onSubmit={handleLineupSubmit} className="mt-6 space-y-4">
                {/* DJ Selection */}
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Select DJ
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
                    <option value="" className="bg-black">
                      Select a DJ
                    </option>
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

                {/* Day Selection */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Day of Week
                  </label>
                  <select
                    value={lineupForm.day}
                    onChange={event =>
                      setLineupForm(prev => ({
                        ...prev,
                        day: event.target.value
                      }))
                    }
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-secondary focus:bg-black/60"
                  >
                    <option value="" className="bg-black">
                      Select a day
                    </option>
                    <option value="Monday" className="bg-black">Monday</option>
                    <option value="Tuesday" className="bg-black">Tuesday</option>
                    <option value="Wednesday" className="bg-black">Wednesday</option>
                    <option value="Thursday" className="bg-black">Thursday</option>
                    <option value="Friday" className="bg-black">Friday</option>
                    <option value="Saturday" className="bg-black">Saturday</option>
                    <option value="Sunday" className="bg-black">Sunday</option>
                  </select>
                </div>

                {/* Time Inputs with Time Picker */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                      Start Time ⏰
                    </label>
                    <input
                      type="time"
                      value={lineupForm.startTime}
                      onChange={event =>
                        setLineupForm(prev => ({
                          ...prev,
                          startTime: event.target.value
                        }))
                      }
                      className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-secondary focus:bg-black/60 [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                      End Time ⏰
                    </label>
                    <input
                      type="time"
                      value={lineupForm.endTime}
                      onChange={event =>
                        setLineupForm(prev => ({
                          ...prev,
                          endTime: event.target.value
                        }))
                      }
                      className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-secondary focus:bg-black/60 [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Show Title */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Show Title
                  </label>
                  <input
                    value={lineupForm.title}
                    onChange={event =>
                      setLineupForm(prev => ({
                        ...prev,
                        title: event.target.value
                      }))
                    }
                    placeholder="e.g., Moonlit Frequencies"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-secondary focus:bg-black/60"
                  />
                </div>

                {/* Genre */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/60">
                    Genre
                  </label>
                  <input
                    value={lineupForm.genre}
                    onChange={event =>
                      setLineupForm(prev => ({
                        ...prev,
                        genre: event.target.value
                      }))
                    }
                    placeholder="e.g., Organic House, Techno, etc."
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-apex-secondary focus:bg-black/60"
                  />
                </div>

            <button
              type="submit"
              disabled={isSubmitting}
                  className="flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-gradient-to-r from-apex-secondary via-apex-accent/80 to-apex-accent text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:opacity-90 disabled:opacity-50"
            >
                  {isSubmitting 
                    ? (editingLineupId ? "Updating..." : "Adding Show...") 
                    : (editingLineupId ? "Update Show" : "Add to Schedule")}
            </button>
          </form>
            </div>

            {/* Lineup List */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
               <h2 className="text-xl font-semibold text-white">
                 Current Schedule
               </h2>
               <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                 {sortedLineup.length} Shows
               </p>

               <div className="mt-6 space-y-3">
              {sortedLineup.map(slot => (
              <div
                key={slot.id}
                    className={clsx(
                      "flex flex-col gap-4 rounded-2xl border px-5 py-4 transition md:flex-row md:items-center md:justify-between",
                      editingLineupId === slot.id
                        ? "border-apex-secondary/50 bg-apex-secondary/10"
                        : "border-white/10 bg-black/40 hover:bg-black/60"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">{slot.title}</p>
                        {(slot as { featured?: boolean }).featured && (
                          <span className="rounded-full bg-apex-accent/20 px-2 py-0.5 text-xs text-apex-accent">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
                    {slot.day} • {slot.startTime} — {slot.endTime}
                  </p>
                      <p className="mt-1 text-xs text-white/40">{slot.genre}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditLineup(slot)}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-apex-secondary/60 hover:text-apex-secondary"
                      >
                        Edit
                      </button>
                  <button
                    onClick={() => handleSetFeatured(slot)}
                    className={clsx(
                          "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.3em] transition",
                      (slot as { featured?: boolean }).featured
                            ? "border-apex-accent/70 bg-apex-accent/10 text-apex-accent"
                        : "border-white/10 text-white/60 hover:border-apex-accent/50 hover:text-apex-accent"
                    )}
                  >
                    {((slot as { featured?: boolean }).featured ?? false)
                      ? "Featured"
                      : "Feature"}
                  </button>
                  <button
                    onClick={() => handleDelete("lineup", slot.id)}
                        className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:border-red-400/60 hover:bg-red-400/10 hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
                 {sortedLineup.length === 0 && (
                   <p className="py-12 text-center text-sm text-white/40">
                     No shows scheduled yet. Add your first show using the form above.
                   </p>
                 )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
