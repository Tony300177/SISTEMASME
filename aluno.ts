export type FicaiRecord = {
  id: string;
  aluno_id: string;
  nome_aluno: string;
  serie: string;
  data_ficai: string;
  created_at: string;
};

export type AlunoFalta = {
  id: string;
  escola: string;
  escolaId: string;
  mes_ano: string;
  dias_falta: string;
  nome_aluno: string;
  turma: string;
  responsavel: string;
  celular: string;
  possui_ficai: boolean;
  created_at: string;
  ficai?: FicaiRecord;
};

export type Observacao = {
  id: string;
  aluno_id: string;
  observacao: string;
  administrador: string;
  created_at: string;
};