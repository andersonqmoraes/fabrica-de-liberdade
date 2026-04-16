"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { onAuthChange } from "@/lib/firebase/auth";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      if (user) {
        setAuthed(true);
      } else {
        router.push("/admin/login");
      }
      setChecking(false);
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-dark-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="flex min-h-screen bg-dark-800">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
