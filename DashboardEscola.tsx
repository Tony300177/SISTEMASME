import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { AlunoFalta } from "../types/aluno";

type DashboardEscolaProps = {
  records: AlunoFalta[];
  onEditRecord: (id: string) => void;
};

const currentMonth = new Date().toISOString().slice(0, 7);

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));
}

function applyFilters(records: AlunoFalta[], month: string, year: string, turma: string) {
  return records.filter((record) => {
    const [recordYear, recordMonth] = record.mes_ano.split("-");
    const matchMonth = month ? recordMonth === month : true;
    const matchYear = year ? recordYear === year : true;
    const matchTurma = turma ? record.turma.toLowerCase().includes(turma.toLowerCase()) : true;
    return matchMonth && matchYear && matchTurma;
  });
}

function countDiasLancados(value: string) {
  const text = String(value).trim();
  if (!text) return 0;
  const numericDays = text.match(/\d+/g);
  return numericDays?.length ?? 1;
}

export default function DashboardEscola({ records, onEditRecord }: DashboardEscolaProps) {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [turma, setTurma] = useState("");

  const filtered = useMemo(() => applyFilters(records, month, year, turma), [records, month, year, turma]);
  const totalAlunos = useMemo(
    () => new Set(records.map((record) => record.nome_aluno.trim().toLowerCase())).size,
    [records],
  );
  const totalFaltas = records.reduce((sum, record) => sum + countDiasLancados(record.dias_falta), 0);
  const casosFicai = records.filter((record) => record.possui_ficai).length;
  const registrosMes = records.filter((record) => record.mes_ano === currentMonth).length;
  const years = Array.from(new Set(records.map((record) => record.mes_ano.slice(0, 4)))).sort().reverse();

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Dashboard da escola</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Acompanhamento dos registros enviados
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Cada unidade visualiza apenas seus próprios lançamentos e pode editar registros ja enviados.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Alunos registrados" value={totalAlunos} />
        <Metric label="Faltas lançadas" value={totalFaltas} />
        <Metric label="Casos FICAI" value={casosFicai} tone="amber" />
        <Metric label="Registros do mês" value={registrosMes} />
      </div>

      <div className="rounded-[1.75rem] border border-slate-900/10 bg-white/75 p-4 shadow-sm shadow-emerald-950/5">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700">
            Mês
            <select
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">Todos</option>
              {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Ano
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">Todos</option>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Turma
            <input
              value={turma}
              onChange={(event) => setTurma(event.target.value)}
              placeholder="Ex.: 5º ano A"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/85">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Nome do aluno</th>
                <th className="px-4 py-3">Turma</th>
                <th className="px-4 py-3">Dias de falta</th>
                <th className="px-4 py-3">Status FICAI</th>
                <th className="px-4 py-3">Data de envio</th>
                <th className="px-4 py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.025 }}
                  className="bg-white/60"
                >
                  <td className="px-4 py-3 font-medium text-slate-950">{record.nome_aluno}</td>
                  <td className="px-4 py-3 text-slate-600">{record.turma}</td>
                  <td className="px-4 py-3 text-slate-600">{record.dias_falta}</td>
                  <td className="px-4 py-3">
                    <span className={record.possui_ficai ? "font-semibold text-amber-700" : "text-slate-500"}>
                      {record.possui_ficai ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(record.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onEditRecord(record.id)}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Editar
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "emerald" }: { label: string; value: number; tone?: "emerald" | "amber" }) {
  return (
    <div className="border-t border-slate-900/10 pt-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`mt-2 text-4xl font-semibold ${tone === "amber" ? "text-amber-700" : "text-emerald-800"}`}>
        {value}
      </p>
    </div>
  );
}