"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Store,
  Tag,
  Grid3X3,
  Globe,
  LogOut,
  Flag,
  Mail,
} from "lucide-react";

const navLinks = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/stores", label: "المتاجر", icon: Store },
  { href: "/admin/coupons", label: "الكوبونات", icon: Tag },
  { href: "/admin/categories", label: "التصنيفات", icon: Grid3X3 },
  { href: "/admin/countries", label: "الدول", icon: Globe },
  { href: "/admin/reports", label: "التقارير", icon: Flag },
  { href: "/admin/inbox", label: "صندوق الوارد", icon: Mail },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-charcoal flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/admin/dashboard" className="block">
          <span className="text-xl font-display font-bold text-brand-gold">
            كوبوناوي
          </span>
          <span className="block text-xs text-white/40 mt-0.5">لوحة الإدارة</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-red text-cream"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.8} />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}
