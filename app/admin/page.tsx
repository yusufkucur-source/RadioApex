import AdminDashboardV2 from "@/components/admin/AdminDashboardV2";

export const metadata = {
  title: "Yönetim Paneli | Radio Apex",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminDashboardV2 />;
}
