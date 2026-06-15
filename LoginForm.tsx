import { motion } from "framer-motion";
import { useState } from "react";
import { DEFAULT_PASSWORD } from "../services/auth";

type LoginFormProps = {
  onLogin: (escolaId: string, usuario: string, senha: string) => string | null;
};

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = onLogin("", usuario, senha);
    setMessage(error ?? "");
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-2xl shadow-emerald-950/20 backdrop-blur sm:p-7"
    >
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Acesso seguro</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Entrar no sistema</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Informe o nome da escola no campo usuario e a senha padrao.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">
          Usuario
          <input
            value={usuario}
            onChange={(event) => setUsuario(event.target.value)}
            placeholder="Nome da escola"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            autoComplete="username"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Senha
          <input
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            type="password"
            placeholder={DEFAULT_PASSWORD}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            autoComplete="current-password"
          />
        </label>
      </div>

      {message ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}

      <button
        type="submit"
        className="mt-6 w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
      >
        Acessar
      </button>

      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <p>
          Usuario: <span className="font-semibold text-slate-900">nome da escola</span>
        </p>
        <p>
          Senha: <span className="font-semibold text-slate-900">{DEFAULT_PASSWORD}</span>
        </p>
        <p>O administrador redefine os acessos.</p>
      </div>
    </motion.form>
  );
}