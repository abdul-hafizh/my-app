import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  CreditCard,
  Wallet,
  Link as LinkIcon,
  Headphones,
  Inbox,
} from "lucide-react";

const menus = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Merchant", href: "/merchants", icon: Store },
  { name: "Transaksi", href: "/transactions", icon: CreditCard },
  { name: "Pencairan", href: "/settlements", icon: Wallet },
  { name: "Metode Bayar", href: "/payment-methods", icon: LinkIcon },
  { name: "Tiket Bantuan", href: "/tickets", icon: Headphones },
  { name: "Callbacks", href: "/callbacks", icon: Inbox },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 text-white">
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">PayMerchant</h1>
        <p className="text-sm text-slate-400 mt-1">Payment Gateway</p>
      </div>

      <nav className="px-4 py-5 space-y-2">
        {menus.map((menu) => {
          const Icon = menu.icon;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-blue-600 hover:text-white transition"
            >
              <Icon size={20} />
              <span>{menu.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-900 p-4">
          <p className="text-sm font-semibold">Admin Panel</p>
          <p className="text-xs text-slate-400 mt-1">Online Payment System</p>
        </div>
      </div>
    </aside>
  );
}