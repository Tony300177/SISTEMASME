import { useEffect, useMemo, useState } from "react";
import type { AlunoFalta } from "../types/aluno";
import type { SessionUser } from "../types/escola";

type NovaFaltaProps = {
  session: SessionUser;
  editingRecord: AlunoFalta | null;
  onSave: (record: AlunoFalta) => void;
  onCancel: () => void;
};

type FormState = {
  mes_ano: string;
  dias_falta: string;
  nome_aluno: string;
  turma: string;
  responsavel: string;
  celular: string;
  possui_ficai: "sim" | "nao";
  ficai_nome: string;
  ficai_serie: string;
  ficai_data: string;
};

const emptyState: FormState = {
  mes_ano: new Date().toISOString().slice(0, 7),
  dias_falta: "",
  nome_aluno: "",
  turma: "",
  responsavel: "",
  celular: "",
  possui_ficai: "nao",
  ficai_nome: "",
  ficai_serie: "",
  ficai_data: "",
};

export default function NovaFalta({ session, editingRecord, onSave, onCancel }: NovaFaltaProps) {
  const [form, setForm] = useState<FormState>(emptyState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingRecord) {
      setForm(emptyState);
      return;
    }

    setForm({
      mes_ano: editingRecord.mes_ano,
      dias_falta: String(editingRecord.dias_falta),
      nome_aluno: editingRecord.nome_aluno,
      turma: editingRecord.turma,
      responsavel: editingRecord.responsavel,
      celular: editingRecord.celular,
      possui_ficai: editingRecord.possui_ficai ? "sim" : "nao",
      ficai_nome: editingRecord.ficai?.nome_aluno ?? editingRecord.nome_aluno,
      ficai_serie: editingRecord.ficai?.serie ?? editingRecord.turma,
      ficai_data: editingRecord.ficai?.data_ficai ?? "",
    });
  }, [editingRecord]);

  const schoolName = useMemo(() => editingRecord?.escola ?? session.escolaNome ?? "", [editingRecord, session.escolaNome]);
  const schoolId = editingRecord?.escolaId ?? session.escolaId ?? "";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const required = [
      form.mes_ano,
      form.dias_falta,
      form.nome_aluno,
      form.turma,
      form.responsavel,
      form.celular,
    ];
    if (required.some((value) => !String(value).trim())) return "Preencha todos os campos obrigatorios.";
    if (form.possui_ficai === "sim" && (!form.ficai_nome || !form.ficai_serie || !form.ficai_data)) {
      return "Informe todos os dados da FICAI quando marcar Sim.";
    }
    if (!schoolId || !schoolName) return "Somente usuarios de escola podem lancar faltas.";
    return "";
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    const alunoId = editingRecord?.id ?? crypto.randomUUID();
    const createdAt = editingRecord?.created_at ?? new Date().toISOString();
    const possuiFicai = form.possui_ficai === "sim";

    onSave({
      id: alunoId,
      escola: schoolName,
      escolaId: schoolId,
      mes_ano: form.mes_ano,
      dias_falta: form.dias_falta.trim(),
      nome_aluno: form.nome_aluno.trim(),
      turma: form.turma.trim(),
      responsavel: form.responsavel.trim(),
      celular: form.celular.trim(),
      possui_ficai: possuiFicai,
      created_at: createdAt,
      ficai: possuiFicai
        ? {
            id: editingRecord?.ficai?.id ?? crypto.randomUUID(),
            aluno_id: alunoId,
            nome_aluno: form.ficai_nome.trim(),
            serie: form.ficai_serie.trim(),
            data_ficai: form.ficai_data,
            created_at: editingRecord?.ficai?.created_at ?? new Date().toISOString(),
          }
        : undefined,
    });
  }

  return (
    <section className="space-y-8">
      <div className="border-b border-slate-900/10 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Lançamento de faltas</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {editingRecord ? "Editar registro enviado" : "Novo registro de aluno"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          A escola e preenchida automaticamente pelo login. Campos FICAI sao obrigatorios quando o caso for marcado.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-[1.75rem] border border-slate-900/10 bg-white/85 p-5 sm:p-6">
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-950">Dados da escola</legend>
          <label className="block text-sm font-medium text-slate-700">
            Escola
            <input
              value={schoolName}
              disabled
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600"
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 md:grid-cols-2">
          <legend className="col-span-full text-lg font-semibold text-slate-950">Dados do aluno</legend>
          <Field label="Mês/Ano" type="month" value={form.mes_ano} onChange={(value) => update("mes_ano", value)} />
          <Field
            label="Dia(s) do mês com falta"
            type="text"
            placeholder="Ex.: 03, 14 e 22"
            value={form.dias_falta}
            onChange={(value) => update("dias_falta", value)}
          />
          <Field label="Nome do aluno" value={form.nome_aluno} onChange={(value) => update("nome_aluno", value)} />
          <Field label="Turma/Ano" value={form.turma} onChange={(value) => update("turma", value)} />
          <Field label="Nome do responsável" value={form.responsavel} onChange={(value) => update("responsavel", value)} />
          <Field label="Número do celular" value={form.celular} onChange={(value) => update("celular", value)} />
        </fieldset>

        <fieldset className="space-y-4 border-t border-slate-900/10 pt-6">
          <legend className="text-lg font-semibold text-slate-950">Campo FICAI</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="radio"
                checked={form.possui_ficai === "sim"}
                onChange={() =>
                  setForm((current) => ({
                    ...current,
                    possui_ficai: "sim",
                    ficai_nome: current.ficai_nome || current.nome_aluno,
                    ficai_serie: current.ficai_serie || current.turma,
                  }))
                }
              />
              Sim
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="radio" checked={form.possui_ficai === "nao"} onChange={() => update("possui_ficai", "nao")} />
              Não
            </label>
          </div>

          {form.possui_ficai === "sim" ? (
            <div className="grid gap-4 rounded-[1.5rem] bg-amber-50 p-4 md:grid-cols-3">
              <Field label="Nome do aluno" value={form.ficai_nome} onChange={(value) => update("ficai_nome", value)} />
              <Field label="Série/Ano" value={form.ficai_serie} onChange={(value) => update("ficai_serie", value)} />
              <Field label="Data da Ficha FICAI" type="date" value={form.ficai_data} onChange={(value) => update("ficai_data", value)} />
            </div>
          ) : null}
        </fieldset>

        {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            {editingRecord ? "Salvar alterações" : "Enviar registro"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}

type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function Field({ label, value, onChange, ...props }: FieldProps) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}