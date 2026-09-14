"use client";

import AdminPanel from "@/components/admin/AdminPanel";

export default function LegacyAdminPage() {
  return (
    <div className="min-h-screen bg-apex-background px-6 py-24 text-white sm:px-10 lg:px-24">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="space-y-3">
          <p className="font-antonio text-xs uppercase tracking-[0.4em] text-white/50">Radio Apex</p>
          <h1 className="font-roboto text-3xl font-semibold text-white sm:text-4xl">Eski Yönetim Paneli</h1>
          <p className="font-spaceGrotesk max-w-2xl text-sm text-white/60">
            Eski yönetim paneli; yalnızca gerektiğinde geri dönüş için saklanır.
          </p>
        </div>
        <AdminPanel />
      </div>
    </div>
  );
}
