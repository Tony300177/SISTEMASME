export type UserRole = "admin" | "escola";

export type Escola = {
  id: string;
  nome: string;
  usuario: string;
  senha: string;
  primeiro_acesso: boolean;
  created_at: string;
};

export type AdminUser = {
  id: "admin";
  nome: string;
  usuario: string;
  senha: string;
  primeiro_acesso: boolean;
  created_at: string;
};

export type AuthUsers = {
  admin: AdminUser;
  escolas: Escola[];
};

export type SessionUser = {
  role: UserRole;
  usuario: string;
  escolaId?: string;
  escolaNome?: string;
  primeiroAcesso: boolean;
};