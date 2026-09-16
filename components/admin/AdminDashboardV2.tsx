"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  Disc3,
  Eye,
  EyeOff,
  Headphones,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Radio,
  Send,
  Trash2,
  Users,
  X
} from "lucide-react";
import clsx from "clsx";
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { getFirebaseApp, getFirebaseAuthInstance, getFirebaseStorageInstance, getFirestoreInstance } from "@/lib/firebase/client";
import { useDJs, useLineup, type DJProfile, type LineupSlot } from "@/lib/firebase/hooks";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type Section = "overview" | "djs" | "lineup" | "notifications";
type Drawer = "dj" | "lineup" | null;
type AnalyticsData = {
  realtimeActiveUsers: number;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  timeline: Array<{ date: string; activeUsers: number; sessions: number }>;
  countries: Array<{ label: string; value: number }>;
  devices: Array<{ label: string; value: number }>;
  channels: Array<{ label: string; value: number }>;
  pages: Array<{ label: string; value: number }>;
  sections: Array<{ label: string; value: number }>;
  generatedAt: string;
};
type NowPlayingData = {
  listeners: number;
};

const emptyDj = { nickname: "", fullName: "", city: "", photoUrl: "", description: "", isActive: true };
const emptyLineup = { day: "Monday", startTime: "", endTime: "", title: "", genre: "", djId: "" };
const navItems: Array<{ id: Section; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
  { id: "djs", label: "DJ'ler", icon: Users },
  { id: "lineup", label: "Yayın Akışı", icon: CalendarDays },
  { id: "notifications", label: "Bildirimler", icon: Bell }
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function dateLabel(value: string) {
  if (value.length !== 8) return value;
  return `${value.slice(6, 8)}.${value.slice(4, 6)}`;
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("rounded-xl border border-white/10 bg-white/[0.035] shadow-sm", className)}>{children}</section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2 text-sm font-medium text-white/80"><span>{label}</span>{children}</label>;
}

const inputClass = "h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-apex-accent focus:ring-2 focus:ring-apex-accent/20";

export default function AdminDashboardV2() {
  const auth = getFirebaseAuthInstance();
  const db = getFirestoreInstance();
  const { data: djs } = useDJs();
  const { data: lineup } = useLineup();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [section, setSection] = useState<Section>("overview");
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [editingDj, setEditingDj] = useState<string | null>(null);
  const [editingLineup, setEditingLineup] = useState<string | null>(null);
  const [djForm, setDjForm] = useState(emptyDj);
  const [djPhotoFile, setDjPhotoFile] = useState<File | null>(null);
  const [lineupForm, setLineupForm] = useState(emptyLineup);
  const [notification, setNotification] = useState({ title: "", body: "", screen: "home" });

  useEffect(() => {
    setReady(Boolean(getFirebaseApp()));
    if (!auth) return;
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  const loadAnalytics = async () => {
    if (!user) return;
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } });
      const responseText = await response.text();
      let payload: { error?: string; errorMessage?: string };
      try {
        payload = JSON.parse(responseText) as { error?: string; errorMessage?: string };
      } catch {
        throw new Error("Canlı sunucu analytics API yerine HTML sayfası döndürüyor. Yeni build sunucuya alınmamış, Node.js app restart edilmemiş veya /api route'u Next.js'e gitmiyor olabilir.");
      }
      if (!response.ok) {
        throw new Error(payload.error || payload.errorMessage || "Analytics verisi yüklenemedi.");
      }
      setAnalytics(payload as AnalyticsData);
    } catch (reason) {
      setAnalyticsError(reason instanceof Error ? reason.message : "Analytics verisi yüklenemedi.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadNowPlaying = async () => {
    try {
      const response = await fetch("/api/now-playing", { cache: "no-store" });
      const payload = await response.json();
      setNowPlaying({ listeners: Number(payload.listeners || 0) });
    } catch {
      setNowPlaying({ listeners: 0 });
    }
  };

  useEffect(() => {
    if (user) {
      void loadAnalytics();
      void loadNowPlaying();
      const interval = window.setInterval(() => void loadNowPlaying(), 30000);
      return () => window.clearInterval(interval);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const djMap = useMemo(() => new Map(djs.map((dj) => [dj.id, dj.nickname])), [djs]);
  const maxUsers = Math.max(...(analytics?.timeline.map((item) => item.activeUsers) || [1]), 1);

  const closeDrawer = () => {
    setDrawer(null);
    setEditingDj(null);
    setEditingLineup(null);
    setDjForm(emptyDj);
    setDjPhotoFile(null);
    setLineupForm(emptyLineup);
  };

  const selectSection = (next: Section) => {
    setSection(next);
    setMobileMenu(false);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError(null);
    try {
      await signInWithEmailAndPassword(auth, String(form.get("email")), String(form.get("password")));
    } catch {
      setError("E-posta veya şifre hatalı.");
    } finally { setBusy(false); }
  };

  const uploadDjPhoto = async (file: File, djId: string) => {
    const storage = getFirebaseStorageInstance();
    if (!user || !storage) throw new Error("Fotoğraf depolama bağlantısı hazır değil.");
    if (!file.type.startsWith("image/")) throw new Error("Sadece resim dosyası yüklenebilir.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Fotoğraf en fazla 5 MB olabilir.");

    const extension = file.type.includes("png") ? "png" : file.type.includes("webp") ? "webp" : "jpg";
    const name = file.name.replace(/\.[a-z0-9]{3,4}$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "photo";
    const storageRef = ref(storage, `djs/${djId}/uploaded-${Date.now()}-${name}.${extension}`);
    await uploadBytes(storageRef, file, { contentType: file.type });
    return getDownloadURL(storageRef);
  };

  const handleDjSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db) return;
    setBusy(true); setError(null);
    try {
      let nextDjForm = { ...djForm };
      if (editingDj) {
        if (djPhotoFile) {
          nextDjForm = { ...nextDjForm, photoUrl: await uploadDjPhoto(djPhotoFile, editingDj) };
        }
        await updateDoc(doc(db, "djs", editingDj), { ...nextDjForm, updatedAt: serverTimestamp() });
        setNotice("DJ güncellendi.");
      } else {
        const nextDoc = doc(collection(db, "djs"));
        if (djPhotoFile) {
          nextDjForm = { ...nextDjForm, photoUrl: await uploadDjPhoto(djPhotoFile, nextDoc.id) };
        }
        await setDoc(nextDoc, { ...nextDjForm, createdAt: serverTimestamp() });
        setNotice("Yeni DJ eklendi.");
      }
      closeDrawer();
    } catch (reason) {
      setError(reason instanceof Error ? `DJ kaydedilemedi. ${reason.message}` : "DJ kaydedilemedi.");
    } finally { setBusy(false); }
  };

  const toggleDjActive = async (dj: DJProfile) => {
    if (!db) return;
    setBusy(true); setError(null);
    try {
      const nextActive = dj.isActive === false;
      await updateDoc(doc(db, "djs", dj.id), { isActive: nextActive, updatedAt: serverTimestamp() });
      setNotice(`${dj.nickname} ${nextActive ? "aktif edildi (sitede görünür)." : "pasife alındı (sitede gizlendi)."}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Durum güncellenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const migrateDjPhotos = async () => {
    if (!user || !window.confirm("Mevcut DJ fotoğraf linkleri Firebase Storage'a taşınsın mı?")) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/migrate-dj-photos", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Fotoğraflar taşınamadı.");
      setNotice(`${payload.migrated || 0} fotoğraf Storage'a taşındı. ${payload.skipped || 0} kayıt atlandı.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Fotoğraflar taşınamadı.");
    } finally {
      setBusy(false);
    }
  };

  const handleLineupSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!db) return;
    setBusy(true); setError(null);
    try {
      if (editingLineup) {
        await updateDoc(doc(db, "lineup", editingLineup), { ...lineupForm, updatedAt: serverTimestamp() });
        setNotice("Program güncellendi.");
      } else {
        await addDoc(collection(db, "lineup"), { ...lineupForm, createdAt: serverTimestamp() });
        setNotice("Program yayın akışına eklendi.");
      }
      closeDrawer();
    } catch { setError("Program kaydedilemedi."); } finally { setBusy(false); }
  };

  const remove = async (collectionName: "djs" | "lineup", id: string) => {
    if (!db || !window.confirm("Bu kaydı silmek istediğine emin misin?")) return;
    setError(null);
    try { await deleteDoc(doc(db, collectionName, id)); setNotice("Kayıt silindi."); }
    catch { setError("Kayıt silinemedi."); }
  };

  const sendNotification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true); setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/.netlify/functions/send-push-notification", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(notification)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error();
      setNotice(`Bildirim ${payload.sent || 0} cihaza gönderildi.`);
      setNotification({ title: "", body: "", screen: "home" });
    } catch { setError("Bildirim gönderilemedi."); } finally { setBusy(false); }
  };

  if (!ready || !auth) return <main className="grid min-h-screen place-items-center bg-apex-background p-6 text-white/70">Firebase yapılandırması bekleniyor.</main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-apex-background p-6"><Panel className="w-full max-w-sm p-6"><div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-lg bg-apex-accent"><Radio size={20} /></span><div><p className="font-semibold text-white">Radio Apex</p><p className="text-xs text-white/50">Yönetim Paneli v2</p></div></div><h1 className="text-xl font-semibold text-white">Giriş yap</h1><p className="mt-1 text-sm text-white/55">Paneli yönetmek için Firebase hesabınla devam et.</p><form onSubmit={handleLogin} className="mt-6 space-y-4"><Field label="E-posta"><input className={inputClass} name="email" type="email" required /></Field><Field label="Şifre"><input className={inputClass} name="password" type="password" required /></Field>{error && <p className="text-sm text-red-300">{error}</p>}<Button disabled={busy} className="w-full bg-apex-accent hover:bg-apex-accent/90">{busy && <Loader2 className="animate-spin" />}Giriş yap</Button></form></Panel></main>;

  return <div className="min-h-screen bg-[#09090b] text-white">
    <aside className={clsx("fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-[#0c0c10] p-4 transition-transform lg:translate-x-0", mobileMenu ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-2 py-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-apex-accent"><Radio size={18} /></span><div><p className="font-semibold">Radio Apex</p><p className="text-[11px] text-white/45">Yönetim Merkezi</p></div></div><button onClick={() => setMobileMenu(false)} className="lg:hidden"><X size={20} /></button></div>
      <nav className="mt-7 space-y-1">{navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => selectSection(id)} className={clsx("flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition", section === id ? "bg-apex-accent text-white shadow" : "text-white/60 hover:bg-white/5 hover:text-white")}><Icon size={18} />{label}</button>)}</nav>
      <div className="mt-auto border-t border-white/10 pt-4"><p className="truncate px-3 text-xs text-white/45">{user.email}</p><button onClick={() => void signOut(auth)} className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white"><LogOut size={18} />Çıkış yap</button></div>
    </aside>
    {mobileMenu && <button onClick={() => setMobileMenu(false)} className="fixed inset-0 z-20 bg-black/60 lg:hidden" aria-label="Menüyü kapat" />}
    <main className="min-h-screen lg:pl-64"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/10 bg-[#09090b]/95 px-4 backdrop-blur lg:px-8"><div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setMobileMenu(true)}><Menu size={22} /></button><div><h1 className="text-base font-semibold">{navItems.find((item) => item.id === section)?.label}</h1><p className="hidden text-xs text-white/45 sm:block">Radio Apex yönetim alanı</p></div></div>{section !== "notifications" && <Button onClick={() => { setDrawer(section === "lineup" ? "lineup" : "dj"); }} className="bg-apex-accent hover:bg-apex-accent/90"><Plus />{section === "lineup" ? "Program ekle" : "DJ ekle"}</Button>}</header>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{error && <div className="mb-5 rounded-md border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}{notice && <div className="mb-5 flex items-center justify-between rounded-md border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{notice}<button onClick={() => setNotice(null)}><X size={16} /></button></div>}
        {section === "overview" && <Overview analytics={analytics} nowPlaying={nowPlaying} analyticsError={analyticsError} analyticsLoading={analyticsLoading} onReload={() => { void loadAnalytics(); void loadNowPlaying(); }} djs={djs.length} lineup={lineup.length} />}
        {section === "djs" && <DjsTable djs={djs} busy={busy} onAdd={() => setDrawer("dj")} onMigratePhotos={() => void migrateDjPhotos()} onToggleActive={toggleDjActive} onEdit={(dj) => { setDjForm({ nickname: dj.nickname, fullName: dj.fullName, city: dj.city, photoUrl: dj.photoUrl, description: dj.description || "", isActive: dj.isActive !== false }); setDjPhotoFile(null); setEditingDj(dj.id); setDrawer("dj"); }} onDelete={(id) => void remove("djs", id)} />}
        {section === "lineup" && <LineupTable lineup={lineup} djs={djMap} onAdd={() => setDrawer("lineup")} onEdit={(slot) => { setLineupForm({ day: slot.day, startTime: slot.startTime, endTime: slot.endTime, title: slot.title, genre: slot.genre, djId: slot.djId || "" }); setEditingLineup(slot.id); setDrawer("lineup"); }} onDelete={(id) => void remove("lineup", id)} />}
        {section === "notifications" && <NotificationForm value={notification} busy={busy} onChange={setNotification} onSubmit={sendNotification} />}
      </div>
    </main>
    {drawer && <Drawer title={drawer === "dj" ? (editingDj ? "DJ düzenle" : "Yeni DJ") : (editingLineup ? "Programı düzenle" : "Yeni program")} onClose={closeDrawer}>{drawer === "dj" ? <DjForm value={djForm} photoFile={djPhotoFile} busy={busy} editing={Boolean(editingDj)} onChange={setDjForm} onPhotoChange={setDjPhotoFile} onSubmit={handleDjSave} /> : <LineupForm value={lineupForm} djs={djs} busy={busy} editing={Boolean(editingLineup)} onChange={setLineupForm} onSubmit={handleLineupSave} />}</Drawer>}
  </div>;
}

function Overview({ analytics, nowPlaying, analyticsError, analyticsLoading, onReload, djs, lineup }: { analytics: AnalyticsData | null; nowPlaying: NowPlayingData | null; analyticsError: string | null; analyticsLoading: boolean; onReload: () => void; djs: number; lineup: number }) {
  const metrics = [
    { label: "Şu an dinleyen", value: nowPlaying?.listeners, icon: Headphones, period: "Canlı: AzuraCast", description: "Site, mobil app ve aynı stream'i kullanan platformlardaki toplam canlı dinleyici." },
    { label: "Şu an sitede", value: analytics?.realtimeActiveUsers, icon: Radio, period: "Canlı: son 30 dk", description: "GA4 realtime verisi. Yaklaşık olarak şu anda sitede aktif olan kişi sayısı." },
    { label: "Son 7 gün aktif", value: analytics?.activeUsers, icon: Users, period: "Dönem: son 7 gün", description: "Bugün dahil son 7 günde siteye giren benzersiz kullanıcı sayısı." },
    { label: "Yeni kullanıcı", value: analytics?.newUsers, icon: Plus, period: "Dönem: son 7 gün", description: "Bugün dahil son 7 günde siteyi ilk kez ziyaret eden kullanıcılar." },
    { label: "Oturum", value: analytics?.sessions, icon: BarChart3, period: "Dönem: son 7 gün", description: "Toplam ziyaret sayısı. Aynı kişi siteye birkaç kez girerse birden fazla oturum sayılır." },
    { label: "Sayfa görüntüleme", value: analytics?.pageViews, icon: Disc3, period: "Dönem: son 7 gün", description: "Açılan toplam sayfa sayısı. Aynı sayfanın tekrar açılması da dahildir." },
  ];
  return <div className="space-y-6"><div><p className="text-sm text-white/50">Canlı dinleyici, canlı site durumu ve bugün dahil son 7 günün GA4 özeti.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">{metrics.map(({ label, value, icon: Icon, period, description }) => <Panel key={label} className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-white/65">{label}</p><p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-apex-accent/80">{period}</p></div><Icon className="shrink-0 text-apex-accent" size={18} /></div><p className="mt-4 text-3xl font-semibold">{analyticsLoading && label !== "Şu an dinleyen" ? "—" : value === undefined ? "—" : formatNumber(value)}</p><p className="mt-3 min-h-14 text-xs leading-5 text-white/42">{description}</p></Panel>)}</div><div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]"><Panel className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Son 7 gün kullanıcı aktivitesi</h2><p className="mt-1 text-sm text-white/45">Her gün için aktif kullanıcı sayısı, bugün dahil</p></div><Button variant="outline" size="sm" onClick={onReload} disabled={analyticsLoading} className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white">{analyticsLoading ? <Loader2 className="animate-spin" /> : "Yenile"}</Button></div>{analyticsError ? <div className="mt-6 rounded-md border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100"><p className="font-medium">GA4 raporu henüz hazır değil</p><p className="mt-1 text-amber-100/70">{analyticsError} Kurulum için <code className="text-xs">GA4_ADMIN_SETUP.md</code> dosyasına bak.</p></div> : analytics?.timeline.length ? <ActivityLineChart data={analytics.timeline} /> : <p className="py-16 text-center text-sm text-white/40">Rapor yükleniyor…</p>}</Panel><Panel className="p-5 sm:p-6"><h2 className="font-semibold">Hızlı görünüm</h2><div className="mt-5 space-y-4"><div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-sm text-white/55">Kayıtlı DJ</span><strong>{djs}</strong></div><div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-sm text-white/55">Planlı program</span><strong>{lineup}</strong></div><div className="flex items-center justify-between"><span className="text-sm text-white/55">Rapor durumu</span><span className={clsx("rounded-full px-2 py-1 text-xs", analytics ? "bg-emerald-400/10 text-emerald-300" : "bg-white/10 text-white/50")}>{analytics ? "Bağlı" : "Kurulum gerekli"}</span></div></div></Panel></div>{analytics && <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5"><Distribution title="Ülke dağılımı" subtitle="Aktif kullanıcı" data={analytics.countries} /><Distribution title="Cihazlar" subtitle="Aktif kullanıcı" data={analytics.devices} /><Distribution title="Trafik kaynağı" subtitle="Oturum" data={analytics.channels} /><Distribution title="En çok açılan sayfalar" subtitle="Görüntüleme" data={analytics.pages} /><Distribution title="En çok görüntülenen bölümler" subtitle="Görüntüleme" data={analytics.sections} /></div>}</div>;
}

function ActivityLineChart({ data }: { data: Array<{ date: string; activeUsers: number; sessions: number }> }) {
  const chartData = data.map((item) => ({
    date: item.date,
    label: dateLabel(item.date),
    activeUsers: item.activeUsers,
    sessions: item.sessions
  }));
  const chartConfig = {
    activeUsers: {
      label: "Aktif kullanıcı",
      color: "hsl(var(--chart-4))",
    },
    sessions: {
      label: "Oturum",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return <div className="mt-7 space-y-5"><ChartContainer config={chartConfig} className="h-72 w-full rounded-md border border-white/10 bg-black/20 p-3"><LineChart accessibilityLayer data={chartData} margin={{ left: 8, right: 16, top: 12, bottom: 8 }}><CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" /><XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} /><YAxis width={34} tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} /><ChartTooltip cursor={{ stroke: "rgba(255,255,255,0.18)" }} content={<ChartTooltipContent indicator="line" labelFormatter={(value) => `Tarih: ${value}`} />} /><Line dataKey="activeUsers" name="Aktif kullanıcı" type="monotone" stroke="var(--color-activeUsers)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} /><Line dataKey="sessions" name="Oturum" type="monotone" stroke="var(--color-sessions)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} /></LineChart></ChartContainer><div className="grid gap-3 text-xs sm:grid-cols-2"><div className="rounded-md border border-white/10 bg-white/[0.03] p-3"><div className="mb-2 flex items-center gap-2"><span className="h-2 w-5 rounded-full bg-[hsl(var(--chart-4))]" /><strong>Aktif kullanıcı ne?</strong></div><p className="leading-5 text-white/45">O gün siteye giren benzersiz kişi sayısı. Aynı kişi birkaç kez girse de genelde tek kullanıcı olarak sayılır.</p></div><div className="rounded-md border border-white/10 bg-white/[0.03] p-3"><div className="mb-2 flex items-center gap-2"><span className="h-2 w-5 rounded-full bg-[hsl(var(--chart-2))]" /><strong>Oturum ne?</strong></div><p className="leading-5 text-white/45">Ziyaret sayısıdır. Aynı kişi sabah ve akşam tekrar girerse bu birden fazla oturum olabilir.</p></div></div></div>;
}

function Distribution({ title, subtitle, data }: { title: string; subtitle: string; data: Array<{ label: string; value: number }> }) {
  const topValue = Math.max(...data.map((item) => item.value), 1);
  return <Panel className="p-5"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs text-white/45">{subtitle} · Son 7 gün</p><div className="mt-5 space-y-3">{data.length ? data.map((item) => <div key={item.label}><div className="flex items-center justify-between gap-3 text-sm"><span className="truncate text-white/70" title={item.label}>{item.label === "(not set)" ? "Belirtilmedi" : item.label}</span><strong className="text-xs">{formatNumber(item.value)}</strong></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-apex-accent/80" style={{ width: `${(item.value / topValue) * 100}%` }} /></div></div>) : <p className="py-5 text-sm text-white/40">Henüz veri yok.</p>}</div></Panel>;
}

function DjsTable({
  djs,
  busy,
  onAdd,
  onMigratePhotos,
  onToggleActive,
  onEdit,
  onDelete
}: {
  djs: DJProfile[];
  busy: boolean;
  onAdd: () => void;
  onMigratePhotos: () => void;
  onToggleActive: (dj: DJProfile) => void;
  onEdit: (dj: DJProfile) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Panel>
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">DJ listesi</h2>
          <p className="mt-1 text-sm text-white/45">
            {djs.length} kayıt ({djs.filter((d) => d.isActive !== false).length} aktif)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onMigratePhotos}
            className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            {busy ? <Loader2 className="animate-spin" /> : null}Fotoğrafları Storage&apos;a taşı
          </Button>
          <Button size="sm" onClick={onAdd} className="bg-apex-accent hover:bg-apex-accent/90">
            <Plus />DJ ekle
          </Button>
        </div>
      </div>
      <div className="divide-y divide-white/10">
        {djs.map((dj) => {
          const isDjActive = dj.isActive !== false;
          return (
            <div
              key={dj.id}
              className={clsx(
                "flex items-center gap-4 p-4 sm:px-5 transition-opacity",
                !isDjActive && "opacity-60"
              )}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10 text-sm font-bold">
                {dj.photoUrl ? (
                  <img src={dj.photoUrl} alt="" className="h-full w-full object-cover object-top" />
                ) : (
                  dj.nickname.slice(0, 1)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium">{dj.nickname}</p>
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border",
                      isDjActive
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-white/5 text-white/45 border-white/10"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        isDjActive ? "bg-emerald-400" : "bg-white/30"
                      )}
                    />
                    {isDjActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <p className="truncate text-sm text-white/45">
                  {dj.fullName} {dj.city && `· ${dj.city}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  aria-label={isDjActive ? "Pasife al" : "Aktifleştir"}
                  title={isDjActive ? "Sitede gizle (Pasife al)" : "Sitede göster (Aktif et)"}
                  onClick={() => onToggleActive(dj)}
                  className={
                    isDjActive
                      ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                      : "text-white/40 hover:bg-white/10 hover:text-white"
                  }
                >
                  {isDjActive ? <Eye size={17} /> : <EyeOff size={17} />}
                </Button>
                <Button variant="ghost" size="icon" aria-label="Düzenle" onClick={() => onEdit(dj)}>
                  <Pencil size={17} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Sil"
                  onClick={() => onDelete(dj.id)}
                  className="text-red-300 hover:bg-red-400/10 hover:text-red-200"
                >
                  <Trash2 size={17} />
                </Button>
              </div>
            </div>
          );
        })}
        {!djs.length && <EmptyState label="Henüz DJ eklenmemiş." onClick={onAdd} />}
      </div>
    </Panel>
  );
}
function LineupTable({ lineup, djs, onAdd, onEdit, onDelete }: { lineup: LineupSlot[]; djs: Map<string, string>; onAdd: () => void; onEdit: (slot: LineupSlot) => void; onDelete: (id: string) => void }) { return <Panel><div className="flex items-center justify-between border-b border-white/10 p-5"><div><h2 className="font-semibold">Yayın akışı</h2><p className="mt-1 text-sm text-white/45">{lineup.length} program</p></div><Button size="sm" onClick={onAdd} className="bg-apex-accent hover:bg-apex-accent/90"><Plus />Program ekle</Button></div><div className="divide-y divide-white/10">{lineup.map((slot) => <div key={slot.id} className="flex items-center gap-4 p-4 sm:px-5"><div className="grid h-10 w-14 shrink-0 place-items-center rounded-md bg-white/5 text-xs text-white/65">{slot.startTime || "—"}</div><div className="min-w-0 flex-1"><p className="truncate font-medium">{slot.title}</p><p className="truncate text-sm text-white/45">{slot.day} · {slot.startTime}–{slot.endTime} · {djs.get(slot.djId || "") || "DJ atanmadı"}</p></div><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Düzenle" onClick={() => onEdit(slot)}><Pencil /></Button><Button variant="ghost" size="icon" aria-label="Sil" onClick={() => onDelete(slot.id)} className="text-red-300 hover:bg-red-400/10 hover:text-red-200"><Trash2 /></Button></div></div>)}{!lineup.length && <EmptyState label="Henüz program eklenmemiş." onClick={onAdd} />}</div></Panel>; }
function EmptyState({ label, onClick }: { label: string; onClick: () => void }) { return <div className="p-12 text-center"><p className="text-sm text-white/45">{label}</p><Button variant="outline" size="sm" onClick={onClick} className="mt-4 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"><Plus />İlk kaydı ekle</Button></div>; }
function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="fixed inset-0 z-40"><button onClick={onClose} className="absolute inset-0 bg-black/65" aria-label="Kapat" /><aside className="absolute inset-y-0 right-0 w-full max-w-lg overflow-y-auto border-l border-white/10 bg-[#111116] p-5 shadow-2xl sm:p-6"><div className="mb-7 flex items-center justify-between"><div><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm text-white/45">Bilgileri kaydettiğinde liste otomatik güncellenir.</p></div><Button variant="ghost" size="icon" onClick={onClose}><X /></Button></div>{children}</aside></div>; }
function DjForm({
  value,
  photoFile,
  onChange,
  onPhotoChange,
  onSubmit,
  busy,
  editing
}: {
  value: typeof emptyDj;
  photoFile: File | null;
  onChange: (value: typeof emptyDj) => void;
  onPhotoChange: (value: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  editing: boolean;
}) {
  const set = (key: keyof typeof emptyDj, next: any) => onChange({ ...value, [key]: next });
  const photoPreview = photoFile ? URL.createObjectURL(photoFile) : value.photoUrl;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-3 cursor-pointer select-none transition hover:bg-white/[0.07]">
        <div>
          <p className="text-sm font-medium text-white">Yayın Durumu</p>
          <p className="text-xs text-white/45">Aktif olduğunda DJ listesinde ziyaretçilere gösterilir.</p>
        </div>
        <input
          type="checkbox"
          checked={value.isActive !== false}
          onChange={(event) => set("isActive", event.target.checked)}
          className="h-5 w-5 accent-[#FD1D35] cursor-pointer rounded"
        />
      </label>
      <Field label="DJ adı">
        <input required className={inputClass} value={value.nickname} onChange={(event) => set("nickname", event.target.value)} />
      </Field>
      <Field label="Ad soyad">
        <input required className={inputClass} value={value.fullName} onChange={(event) => set("fullName", event.target.value)} />
      </Field>
      <Field label="Şehir">
        <input className={inputClass} value={value.city} onChange={(event) => set("city", event.target.value)} />
      </Field>
      <div className="rounded-md border border-white/10 bg-black/20 p-3">
        <div className="flex items-center gap-3">
          {photoPreview ? (
            <img src={photoPreview} alt="" className="h-14 w-14 rounded-md object-cover object-top" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-md bg-white/10 text-xs text-white/35">Foto</div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/80">DJ fotoğrafı</p>
            <p className="mt-1 truncate text-xs text-white/40">
              {photoFile ? photoFile.name : value.photoUrl ? "Mevcut fotoğraf korunur." : "JPG, PNG veya WEBP yükle."}
            </p>
          </div>
        </div>
        <input
          className="mt-3 block w-full text-sm text-white/70 file:mr-3 file:rounded-md file:border-0 file:bg-apex-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-apex-accent/90"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            if (file && file.size > 5 * 1024 * 1024) {
              event.currentTarget.value = "";
              onPhotoChange(null);
              window.alert("Fotoğraf en fazla 5 MB olabilir.");
              return;
            }
            onPhotoChange(file);
          }}
        />
        {photoFile && (
          <button type="button" className="mt-2 text-xs text-white/45 hover:text-white" onClick={() => onPhotoChange(null)}>
            Seçilen dosyayı kaldır
          </button>
        )}
      </div>
      <Field label="Fotoğraf URL">
        <input className={inputClass} type="url" value={value.photoUrl} placeholder="İstersen manuel link de kullanabilirsin" onChange={(event) => set("photoUrl", event.target.value)} />
      </Field>
      <Field label="Açıklama">
        <textarea className="min-h-28 w-full rounded-md border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-apex-accent" value={value.description} onChange={(event) => set("description", event.target.value)} />
      </Field>
      <Button disabled={busy} className="mt-3 w-full bg-apex-accent hover:bg-apex-accent/90">
        {busy && <Loader2 className="animate-spin" />}
        {editing ? "Değişiklikleri kaydet" : "DJ ekle"}
      </Button>
    </form>
  );
}
function LineupForm({ value, djs, onChange, onSubmit, busy, editing }: { value: typeof emptyLineup; djs: DJProfile[]; onChange: (value: typeof emptyLineup) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; busy: boolean; editing: boolean }) { const set = (key: keyof typeof emptyLineup, next: string) => onChange({ ...value, [key]: next }); return <form onSubmit={onSubmit} className="space-y-4"><Field label="Program adı"><input required className={inputClass} value={value.title} onChange={(event) => set("title", event.target.value)} /></Field><Field label="DJ"><select className={inputClass} value={value.djId} onChange={(event) => set("djId", event.target.value)}><option value="">DJ seç</option>{djs.map((dj) => <option key={dj.id} value={dj.id}>{dj.nickname}</option>)}</select></Field><div className="grid grid-cols-2 gap-3"><Field label="Gün"><select className={inputClass} value={value.day} onChange={(event) => set("day", event.target.value)}>{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => <option key={day}>{day}</option>)}</select></Field><Field label="Tür"><input className={inputClass} value={value.genre} onChange={(event) => set("genre", event.target.value)} /></Field></div><div className="grid grid-cols-2 gap-3"><Field label="Başlangıç"><input required className={inputClass} type="time" value={value.startTime} onChange={(event) => set("startTime", event.target.value)} /></Field><Field label="Bitiş"><input required className={inputClass} type="time" value={value.endTime} onChange={(event) => set("endTime", event.target.value)} /></Field></div><Button disabled={busy} className="mt-3 w-full bg-apex-accent hover:bg-apex-accent/90">{busy && <Loader2 className="animate-spin" />}{editing ? "Değişiklikleri kaydet" : "Programı ekle"}</Button></form>; }
function NotificationForm({ value, onChange, onSubmit, busy }: { value: { title: string; body: string; screen: string }; onChange: (value: { title: string; body: string; screen: string }) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; busy: boolean }) { return <Panel className="max-w-2xl p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-md bg-apex-accent/15 text-apex-accent"><Bell size={19} /></span><div><h2 className="font-semibold">Mobil bildirim gönder</h2><p className="text-sm text-white/45">Tüm izinli Radio Apex kullanıcılarına ulaşır.</p></div></div><form onSubmit={onSubmit} className="mt-7 space-y-4"><Field label="Başlık"><input required maxLength={80} className={inputClass} value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} /></Field><Field label="Mesaj"><textarea required maxLength={240} className="min-h-28 w-full rounded-md border border-white/10 bg-black/30 p-3 text-sm text-white outline-none focus:border-apex-accent" value={value.body} onChange={(event) => onChange({ ...value, body: event.target.value })} /></Field><Field label="Açılacak ekran"><select className={inputClass} value={value.screen} onChange={(event) => onChange({ ...value, screen: event.target.value })}><option value="home">Ana sayfa</option><option value="djs">DJ listesi</option><option value="lineup">Yayın akışı</option></select></Field><Button disabled={busy} className="w-full bg-apex-accent hover:bg-apex-accent/90">{busy ? <Loader2 className="animate-spin" /> : <Send />}Bildirimi gönder</Button></form></Panel>; }
