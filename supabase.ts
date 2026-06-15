import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const supabaseIsConfigured = Boolean(supabase);

export type DatabaseTables = {
  escolas: "escolas";
  alunosFaltas: "alunos_faltas";
  ficai: "ficai";
  observacoes: "observacoes";
};