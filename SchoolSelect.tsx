import type { Escola } from "../types/escola";

type SchoolSelectProps = {
  escolas: Escola[];
  value: string;
  onChange: (value: string) => void;
  includeAdmin?: boolean;
  className?: string;
};

export default function SchoolSelect({
  escolas,
  value,
  onChange,
  includeAdmin = false,
  className = "",
}: SchoolSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 ${className}`}
    >
      <option value="">Selecione</option>
      {includeAdmin ? <option value="admin">Central Administrativa</option> : null}
      {escolas.map((escola) => (
        <option key={escola.id} value={escola.id}>
          {escola.nome}
        </option>
      ))}
    </select>
  );
}