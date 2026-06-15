import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import SchoolSelect from "../components/SchoolSelect";
import type { AlunoFalta } from "../types/aluno";
import type { Escola } from "../types/escola";

type RelatoriosProps = {
  records: AlunoFalta[];
  escolas: Escola[];
  isAdmin: boolean;
};

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

function toRows(records: AlunoFalta[]) {
  return records.map((record) => ({
    Escola: record.escola,
    "Mes/Ano": record.mes_ano,
    Aluno: record.nome_aluno,
    Turma: record.turma,
    "Dias de falta": record.dias_falta,
    Responsavel: record.responsavel,
    Celular: record.celular,
    FICAI: record.possui_ficai ? "Sim" : "Nao",
    "Data de envio": new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(record.created_at),
    ),
  }));
}

export default function Relatorios({ records, escolas, isAdmin }: RelatoriosProps) {
  const [schoolId, setSchoolId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [turma, setTurma] = useState("");

  const filtered = useMemo(
    () => applyFilters(records, schoolId, month, year, turma),
    [records, schoolId, month, year, turma],
  );
  const years = Array.from(new Set(records.map((record) => record.mes_ano.slice(0, 4)))).sort().reverse();

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(toRows(filtered));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faltas");
    XLSX.writeFile(workbook, "relatorio-faltas.xlsx");
  }

  function exportPdf() {
    const doc = new jsPDF({ orientation: "landscape" });
    const rows = toRows(filtered);
    let y = 22;

    doc.setFontSize(16);
    doc.text("Relatorio de faltas escolares", 14, 14);
    doc.setFontSize(9);
    rows.forEach((row, index) => {
      if (y > 190) {
        doc.addPage();
        y = 18;
      }
      doc.text(
        `${index + 1}. ${row.Escola} | ${row.Aluno} | ${row.Turma} | ${row["Dias de falta"]} faltas | FICAI: ${row.FICAI} | ${row["Data de envio"]}`,
        14,
        y,
      );
      y += 7;
    });
    if (rows.length === 0) doc.text("Nenhum registro encontrado.", 14, y);
    doc.save("relatorio-faltas.pdf");
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-900/10 pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Relatórios</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Exportação dos registros de faltas
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Use os filtros antes de emitir PDF ou Excel. Escolas exportam apenas seus registros; administradores exportam a rede.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-slate-900/10 bg-white/75 p-4 shadow-sm shadow-emerald-950/5">
        <div className="grid gap-3 md:grid-cols-4">
          {isAdmin ? (
            <label className="text-sm font-medium text-slate-700">
              Escola
              <SchoolSelect escolas={escolas} value={schoolId} onChange={setSchoolId} />
            </label>
          ) : null}
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

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">{filtered.length} registro(s) pronto(s) para exportação.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={exportPdf}
              className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Exportar PDF
            </button>
            <button
              type="button"
              onClick={exportExcel}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/85">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Escola</th>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Turma</th>
                <th className="px-4 py-3">Faltas</th>
                <th className="px-4 py-3">FICAI</th>
                <th className="px-4 py-3">Mês/Ano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((record) => (
                <tr key={record.id} className="bg-white/60">
                  <td className="px-4 py-3 font-medium text-slate-950">{record.escola}</td>
                  <td className="px-4 py-3 text-slate-700">{record.nome_aluno}</td>
                  <td className="px-4 py-3 text-slate-600">{record.turma}</td>
                  <td className="px-4 py-3 text-slate-600">{record.dias_falta}</td>
                  <td className="px-4 py-3 text-slate-600">{record.possui_ficai ? "Sim" : "Não"}</td>
                  <td className="px-4 py-3 text-slate-600">{record.mes_ano}</td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Nenhum registro encontrado para exportação.
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