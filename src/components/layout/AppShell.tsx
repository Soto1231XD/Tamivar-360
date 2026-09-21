import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, FolderKanban } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Inicio", icon: Compass },
  { to: "/projects", label: "Proyectos", icon: FolderKanban },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="flex h-full min-h-screen bg-surface-950">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-surface-800 bg-surface-900 px-3 py-4 sm:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-surface-950 font-bold">
            T
          </div>
          <span className="text-sm font-semibold text-surface-50">Tamivar 360</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-500/10 text-accent-400"
                    : "text-surface-300 hover:bg-surface-800 hover:text-surface-100"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
