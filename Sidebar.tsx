import { motion } from "framer-motion";
import type { UserRole } from "../types/escola";

export type AppView = "dashboard" | "nova-falta" | "relatorios";

type SidebarProps = {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  role: UserRole;
};

const labels: Record<AppView, string> = {
  dashboard: "Dashboard",
  "nova-falta": "Lançar faltas",
  relatorios: "Relatórios",
};

export default function Sidebar({ currentView, onChangeView, role }: SidebarProps) {
  const items: AppView[] = role === "admin" ? ["dashboard", "relatorios"] : ["dashboard", "nova-falta", "relatorios"];

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-24 space-y-2">
        {items.map((item) => {
          const active = item === currentView;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChangeView(item)}
              className="relative flex w-full items-center rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-white/65"
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-white shadow-sm shadow-emerald-950/5"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              ) : null}
              <span className="relative">{labels[item]}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}