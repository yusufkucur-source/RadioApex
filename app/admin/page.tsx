"use client";

import AdminPanel from "@/components/admin/AdminPanel";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-apex-background px-6 py-24 text-white sm:px-10 lg:px-24">
      <div className="mx-auto max-w-6xl space-y-12">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Radio Apex
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Yönetim Paneli
          </h1>
          <p className="max-w-2xl text-sm text-white/60">
            Firebase Auth ile korunan bu panel üzerinden DJ listesi ve yayın
            akışını yönetebilirsiniz.
          </p>
        </div>
        <AdminPanel />
      </div>
    </div>
  );
}
