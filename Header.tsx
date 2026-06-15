import type { SessionUser } from "../types/escola";

type HeaderProps = {
  session: SessionUser;
  onLogout: () => void;
};

export default function Header({ session, onLogout }: HeaderProps) {
  const label = session.role === "admin" ? "Central Administrativa" : session.escolaNome;

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[#f7f5ef]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Controle de faltas</p>
          <h1 className="truncate text-lg font-semibold text-slate-950 sm:text-2xl">{label}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">{session.usuario}</p>
            <p className="text-xs text-slate-500">{session.role === "admin" ? "Administrador" : "Escola"}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-2xl border border-slate-300 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}