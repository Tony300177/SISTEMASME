import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardEscola from "./pages/DashboardEscola";
import NovaFalta from "./pages/NovaFalta";
import Relatorios from "./pages/Relatorios";
import Sidebar, { type AppView } from "./components/Sidebar";
import {
  authenticate,
  DEFAULT_PASSWORD,
  getStoredUsers,
  resetUserPassword,
  updateUserPassword,
} from "./services/auth";
import type { AlunoFalta, Observacao } from "./types/aluno";
import type { AuthUsers, SessionUser } from "./types/escola";

const RECORDS_KEY = "controle_faltas_registros";
const OBS_KEY = "controle_faltas_observacoes";
const SESSION_KEY = "controle_faltas_sessao";

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function App() {
  const [users, setUsers] = useState<AuthUsers>(() => getStoredUsers());
  const [session, setSession] = useState<SessionUser | null>(() =>
    readStorage<SessionUser | null>(SESSION_KEY, null),
  );
  const [view, setView] = useState<AppView>("dashboard");
  const [records, setRecords] = useState<AlunoFalta[]>(() => readStorage(RECORDS_KEY, []));
  const [observacoes, setObservacoes] = useState<Observacao[]>(() => readStorage(OBS_KEY, []));
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => writeStorage(RECORDS_KEY, records), [records]);
  useEffect(() => writeStorage(OBS_KEY, observacoes), [observacoes]);
  useEffect(() => {
    if (session) writeStorage(SESSION_KEY, session);
    else localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const visibleRecords = useMemo(() => {
    if (!session || session.role === "admin") return records;
    return records.filter((record) => record.escolaId === session.escolaId);
  }, [records, session]);

  const editingRecord = useMemo(
    () => records.find((record) => record.id === editingId) ?? null,
    [records, editingId],
  );

  const handleLogin = (escolaId: string, usuario: string, senha: string) => {
    const result = authenticate(escolaId, usuario, senha);
    if (!result.ok) return result.message;

    setUsers(getStoredUsers());
    setSession(result.session);
    setView("dashboard");
    setEditingId(null);
    return null;
  };

  const handleLogout = () => {
    setSession(null);
    setView("dashboard");
    setEditingId(null);
  };

  const handlePasswordChange = (newPassword: string) => {
    if (!session) return;
    updateUserPassword(session, newPassword);
    const updatedSession: SessionUser = { ...session, primeiroAcesso: false };

    setUsers(getStoredUsers());
    setSession(updatedSession);
  };

  const handleResetPassword = (target: "admin" | string) => {
    resetUserPassword(target);
    setUsers(getStoredUsers());
  };

  const handleSaveRecord = (payload: AlunoFalta) => {
    setRecords((current) => {
      const exists = current.some((record) => record.id === payload.id);
      if (exists) return current.map((record) => (record.id === payload.id ? payload : record));
      return [payload, ...current];
    });
    setEditingId(null);
    setView("dashboard");
  };

  const handleEditRecord = (id: string) => {
    setEditingId(id);
    setView("nova-falta");
  };

  const handleAddObservation = (alunoId: string, observacao: string) => {
    if (!session || session.role !== "admin" || !observacao.trim()) return;
    setObservacoes((current) => [
      {
        id: crypto.randomUUID(),
        aluno_id: alunoId,
        observacao: observacao.trim(),
        administrador: session.usuario,
        created_at: new Date().toISOString(),
      },
      ...current,
    ]);
  };

  if (!session) {
    return <Login onLogin={handleLogin} />;
  }

  if (session.primeiroAcesso) {
    return (
      <FirstAccessScreen
        session={session}
        onLogout={handleLogout}
        onPasswordChange={handlePasswordChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-slate-950">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -left-32 top-16 h-96 w-96 rounded-full bg-emerald-200/60 blur-3xl"
          animate={{ x: [0, 45, 0], y: [0, 25, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-20 h-96 w-96 rounded-full bg-amber-200/70 blur-3xl"
          animate={{ x: [0, -35, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Header session={session} onLogout={handleLogout} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <Sidebar
          currentView={view}
          onChangeView={(nextView) => {
            setView(nextView);
            if (nextView !== "nova-falta") setEditingId(null);
          }}
          role={session.role}
        />

        <main className="min-w-0 flex-1">
          <MobileNav
            currentView={view}
            onChangeView={(nextView) => {
              setView(nextView);
              if (nextView !== "nova-falta") setEditingId(null);
            }}
            role={session.role}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={`${view}-${editingId ?? "new"}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {view === "dashboard" && session.role === "admin" ? (
                <DashboardAdmin
                  records={records}
                  observacoes={observacoes}
                  escolas={users.escolas}
                  users={users}
                  onAddObservation={handleAddObservation}
                  onResetPassword={handleResetPassword}
                />
              ) : null}

              {view === "dashboard" && session.role === "escola" ? (
                <DashboardEscola records={visibleRecords} onEditRecord={handleEditRecord} />
              ) : null}

              {view === "nova-falta" ? (
                <NovaFalta
                  session={session}
                  editingRecord={editingRecord}
                  onCancel={() => {
                    setEditingId(null);
                    setView("dashboard");
                  }}
                  onSave={handleSaveRecord}
                />
              ) : null}

              {view === "relatorios" ? (
                <Relatorios
                  records={visibleRecords}
                  escolas={users.escolas}
                  isAdmin={session.role === "admin"}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

type MobileNavProps = {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  role: SessionUser["role"];
};

function MobileNav({ currentView, onChangeView, role }: MobileNavProps) {
  const items: AppView[] = role === "admin" ? ["dashboard", "relatorios"] : ["dashboard", "nova-falta", "relatorios"];
  const labels: Record<AppView, string> = {
    dashboard: "Dashboard",
    "nova-falta": "Lançar",
    relatorios: "Relatórios",
  };

  return (
    <div className="mb-5 grid gap-2 rounded-2xl bg-white/70 p-2 lg:hidden">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChangeView(item)}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
            currentView === item ? "bg-emerald-700 text-white" : "text-slate-700 hover:bg-white"
          }`}
        >
          {labels[item]}
        </button>
      ))}
    </div>
  );
}

type FirstAccessProps = {
  session: SessionUser;
  onLogout: () => void;
  onPasswordChange: (newPassword: string) => void;
};

function FirstAccessScreen({ session, onLogout, onPasswordChange }: FirstAccessProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const schoolLabel = session.role === "admin" ? "Central Administrativa" : session.escolaNome;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 6) {
      setMessage("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password === DEFAULT_PASSWORD) {
      setMessage("Escolha uma senha diferente da senha padrao inicial.");
      return;
    }
    if (password !== confirm) {
      setMessage("As senhas informadas nao conferem.");
      return;
    }

    onPasswordChange(password);
  }

  return (
    <div className="min-h-screen bg-[#12332d] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <motion.section
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
            Primeiro acesso
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Proteja o acesso antes de registrar novas faltas.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-emerald-50/80">
              O usuario {session.usuario} de {schoolLabel} esta usando a senha inicial. A troca e obrigatoria
              para liberar o sistema.
            </p>
          </div>
        </motion.section>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="space-y-5 rounded-[2rem] border border-white/15 bg-white p-6 text-slate-950 shadow-2xl shadow-black/20"
        >
          <div>
            <h2 className="text-2xl font-semibold">Alterar senha</h2>
            <p className="mt-2 text-sm text-slate-600">Use uma senha segura e diferente de {DEFAULT_PASSWORD}.</p>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Nova senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              autoComplete="new-password"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirmar senha
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              autoComplete="new-password"
            />
          </label>
          {message ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              Salvar e entrar
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
