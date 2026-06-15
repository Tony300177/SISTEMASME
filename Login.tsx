import { motion } from "framer-motion";
import LoginForm from "../components/LoginForm";

type LoginProps = {
  onLogin: (escolaId: string, usuario: string, senha: string) => string | null;
};

export default function Login({ onLogin }: LoginProps) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#12332d] text-white">
      <div className="absolute inset-0 opacity-40">
        <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(167,243,208,0.35),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(251,191,36,0.24),transparent_26%),linear-gradient(135deg,#12332d,#0f241f)]" />
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-48 w-full bg-emerald-200/10"
        style={{ clipPath: "polygon(0 45%, 100% 5%, 100% 100%, 0% 100%)" }}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8">
        <motion.section
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="space-y-7"
        >
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
              Rede municipal
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl">
              Sistema de Controle de Faltas Escolares
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-emerald-50/80">
              Lançamento online por escola, acompanhamento centralizado e gestão dos casos FICAI em uma unica area segura.
            </p>
          </div>
          <div className="grid max-w-2xl gap-3 text-sm text-emerald-50/80 sm:grid-cols-3">
            <span className="border-t border-white/20 pt-3">Controle por unidade</span>
            <span className="border-t border-white/20 pt-3">Observações administrativas</span>
            <span className="border-t border-white/20 pt-3">Relatórios PDF e Excel</span>
          </div>
        </motion.section>

        <LoginForm onLogin={onLogin} />
      </main>
      <footer className="relative z-10 px-4 pb-6 text-center text-sm font-medium text-emerald-50/75">
        Desenvolvido Pelo Departamento de Tecnologia da SME
      </footer>
    </div>
  );
}