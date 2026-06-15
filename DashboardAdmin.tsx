import { useMemo, useState } from "react";
import SchoolSelect from "../components/SchoolSelect";
import { DEFAULT_PASSWORD } from "../services/auth";
import type { AlunoFalta, Observacao } from "../types/aluno";
import type { AuthUsers, Escola } from "../types/escola";

type DashboardAdminProps = {
  records: AlunoFalta[];
  observacoes: Observacao[];
  escolas: Escola[];
  users: AuthUsers;
  onAddObservation: (alunoId: string, observacao: string) => void;
  onResetPassword: (target: "admin" | string) => void;
};

const currentMonth = new Date().toISOString().slice(0, 7);

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));
}

function applyFilters(records: AlunoFalta[], escolaId: string, month: string, year: string, turma: string) {
  return records.filter((record) => {
    const [recordYear, recordMonth] = record.mes_ano.split("-");
    const matchSchool = escolaId ? record.escolaId === escolaId : true;
    const matchMonth = month ? recordMonth === month : true;
    const matchYear = year ? recordYear === year : true;
    const matchTurma = turma ? record.turma.toLowerCase().includes(turma.toLowerCase()) : true;
    return matchSchool && matchMonth && matchYear && matchTurma;
  });
}

export default function DashboardAdmin({
  records,
  observacoes,
  escolas,
  users,
  onAddObservation,
  onResetPassword,
}: DashboardAdminProps) {
  const [schoolId, setSchoolId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [turma, setTurma] = useState("");

  const filtered = useMemo(
    () =>
      applyFilters(records, schoolId, month, year, turma).sort((a, b) =>
        a.escola.localeCompare(b.escola) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [records, schoolId, month, year, turma],
  );
  const years = Array.from(new Set(records.map((record) => record.mes_ano.slice(0, 4)))).sort().reverse();
  const casosFicai = records.filter((record) => record.possui_ficai).length;
  const registrosMes = records.filter((record) => record.mes_ano === currentMonth).length;

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Dashboard administrativo</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Gestão centralizada da rede municipal
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Todos os registros enviados aparecem para o administrador organizados por escola, com acompanhamento FICAI e observações.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Total de escolas" value={escolas.length} />
        <Metric label="Total de registros" value={records.length} />
        <Metric label="Casos FICAI" value={casosFicai} tone="amber" />
        <Metric label="Registros do mês" value={registrosMes} />
      </div>

      <div className="rounded-[1.75rem] border border-slate-900/10 bg-white/75 p-4 shadow-sm shadow-emerald-950/5">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            Escola
            <SchoolSelect escolas={escolas} value={schoolId} onChange={setSchoolId} />
          </label>
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
              placeholder="Filtrar turma"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/85">
        <div className="border-b border-slate-100 px-4 py-4">
          <h3 className="text-lg font-semibold text-slate-950">Registros das escolas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Escola</th>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Turma</th>
                <th className="px-4 py-3">Faltas</th>
                <th className="px-4 py-3">FICAI</th>
                <th className="px-4 py-3">Envio</th>
                <th className="px-4 py-3">Observação administrativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((record) => (
                <tr key={record.id} className="bg-white/60 align-top">
                  <td className="px-4 py-3 font-medium text-slate-950">{record.escola}</td>
                  <td className="px-4 py-3 text-slate-700">{record.nome_aluno}</td>
                  <td className="px-4 py-3 text-slate-600">{record.turma}</td>
                  <td className="px-4 py-3 text-slate-600">{record.dias_falta}</td>
                  <td className="px-4 py-3">
                    <span className={record.possui_ficai ? "font-semibold text-amber-700" : "text-slate-500"}>
                      {record.possui_ficai ? "Sim" : "Não"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(record.created_at)}</td>
                  <td className="min-w-72 px-4 py-3">
                    <ObservationBox
                      recordId={record.id}
                      observacoes={observacoes.filter((item) => item.aluno_id === record.id)}
                      onAddObservation={onAddObservation}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-slate-900/10 bg-white/85 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-end">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Gerenciamento de usuários</h3>
            <p className="mt-1 text-sm text-slate-600">A redefinição restaura a senha {DEFAULT_PASSWORD} e reativa a troca obrigatoria.</p>
          </div>
          <button
            type="button"
            onClick={() => onResetPassword("admin")}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Redefinir admin
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-3">Escola</th>
                <th className="px-2 py-3">Usuário</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.escolas.map((escola) => (
                <tr key={escola.id}>
                  <td className="px-2 py-3 font-medium text-slate-900">{escola.nome}</td>
                  <td className="px-2 py-3 text-slate-600">{escola.usuario}</td>
                  <td className="px-2 py-3 text-slate-600">
                    {escola.primeiro_acesso ? "Primeiro acesso pendente" : "Senha alterada"}
                  </td>
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={() => onResetPassword(escola.id)}
                      className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Redefinir senha
                    </button>
                  </td>
                </tr>
              ))}
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

function ObservationBox({
  recordId,
  observacoes,
  onAddObservation,
}: {
  recordId: string;
  observacoes: Observacao[];
  onAddObservation: (alunoId: string, observacao: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {observacoes.slice(0, 2).map((item) => (
          <p key={item.id} className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
            <span className="font-semibold text-slate-800">{item.administrador}:</span> {item.observacao}
          </p>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ex.: Família contatada"
        rows={2}
        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
      <button
        type="button"
        onClick={() => {
          onAddObservation(recordId, value);
          setValue("");
        }}
        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
      >
        Inserir observação
      </button>
    </div>
  );
}