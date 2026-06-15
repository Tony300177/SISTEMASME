import type { AuthUsers, Escola, SessionUser } from "../types/escola";

export const DEFAULT_PASSWORD = "123";

const USERS_KEY = "controle_faltas_usuarios";

export const ESCOLAS_FIXAS = [
  "CEI LUIZ FELIPE",
  "CEI SAO CRISTOVAO",
  "CEI ARCO IRIS",
  "CEI BRUNO LEONARDO",
  "CEI DOM FRANCO",
  "CEI MENINO JESUS",
  "CEI NOSSO LAR",
  "CEI VASCO PAPA",
  "CEI CRIANCA FELIZ",
  "CEM GUILHERME",
  "CEM ORLANDO PEREIRA",
  "EM MARIA HILDA",
  "EM PAULO FREIRE",
  "EM JOSE ANCHIETA",
  "ERM ALVARES AZEVEDO",
  "ERM CORA CORALINA",
  "ERM EUCLIDES CUNHA",
  "ERM OSVALDO CRUZ",
  "ERM VINICIUS DE MORAIS",
];

function credentialKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function createInitialUsers(): AuthUsers {
  const createdAt = new Date().toISOString();
  const escolas: Escola[] = ESCOLAS_FIXAS.map((nome, index) => ({
    id: `escola-${index + 1}`,
    nome,
    usuario: nome,
    senha: DEFAULT_PASSWORD,
    primeiro_acesso: true,
    created_at: createdAt,
  }));

  return {
    admin: {
      id: "admin",
      nome: "Central Administrativa",
      usuario: "admin",
      senha: DEFAULT_PASSWORD,
      primeiro_acesso: true,
      created_at: createdAt,
    },
    escolas,
  };
}

function saveUsers(users: AuthUsers) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function normalizeUsers(users: AuthUsers): AuthUsers {
  const createdAt = users.admin?.created_at ?? new Date().toISOString();
  return {
    admin: {
      ...users.admin,
      id: "admin",
      nome: "Central Administrativa",
      usuario: "admin",
      senha: users.admin?.senha === "123456" ? DEFAULT_PASSWORD : users.admin?.senha ?? DEFAULT_PASSWORD,
      primeiro_acesso: users.admin?.primeiro_acesso ?? true,
      created_at: createdAt,
    },
    escolas: ESCOLAS_FIXAS.map((nome, index) => {
      const id = `escola-${index + 1}`;
      const stored = users.escolas?.find((school) => school.id === id || credentialKey(school.nome) === credentialKey(nome));
      return {
        id,
        nome,
        usuario: nome,
        senha: stored?.senha === "123456" ? DEFAULT_PASSWORD : stored?.senha ?? DEFAULT_PASSWORD,
        primeiro_acesso: stored?.primeiro_acesso ?? true,
        created_at: stored?.created_at ?? createdAt,
      };
    }),
  };
}

export function getStoredUsers(): AuthUsers {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const seeded = createInitialUsers();
      saveUsers(seeded);
      return seeded;
    }

    const normalized = normalizeUsers(JSON.parse(raw) as AuthUsers);
    saveUsers(normalized);
    return normalized;
  } catch {
    const seeded = createInitialUsers();
    saveUsers(seeded);
    return seeded;
  }
}

export function authenticate(
  escolaId: string,
  usuario: string,
  senha: string,
): { ok: true; session: SessionUser } | { ok: false; message: string } {
  const users = getStoredUsers();
  const cleanUser = usuario.trim();
  const cleanKey = credentialKey(cleanUser);

  if (!cleanUser) return { ok: false, message: "Informe o usuario com o nome da escola." };

  const isAdminLogin =
    escolaId === "admin" || cleanKey === credentialKey(users.admin.usuario) || cleanKey === credentialKey(users.admin.nome);

  if (isAdminLogin) {
    const admin = users.admin;
    if (admin.senha !== senha) {
      return { ok: false, message: "Usuario ou senha invalidos para o administrador." };
    }

    return {
      ok: true,
      session: {
        role: "admin",
        usuario: admin.usuario,
        primeiroAcesso: admin.primeiro_acesso,
      },
    };
  }

  const escola = escolaId
    ? users.escolas.find((item) => item.id === escolaId)
    : users.escolas.find((item) => credentialKey(item.usuario) === cleanKey || credentialKey(item.nome) === cleanKey);
  if (!escola) return { ok: false, message: "Escola nao encontrada. Use o nome da escola como usuario." };
  if (escola.senha !== senha) {
    return { ok: false, message: "Usuario ou senha invalidos para a escola informada." };
  }

  return {
    ok: true,
    session: {
      role: "escola",
      usuario: escola.usuario,
      escolaId: escola.id,
      escolaNome: escola.nome,
      primeiroAcesso: escola.primeiro_acesso,
    },
  };
}

export function updateUserPassword(session: SessionUser, newPassword: string) {
  const users = getStoredUsers();
  if (session.role === "admin") {
    users.admin = { ...users.admin, senha: newPassword, primeiro_acesso: false };
  } else {
    users.escolas = users.escolas.map((school) =>
      school.id === session.escolaId ? { ...school, senha: newPassword, primeiro_acesso: false } : school,
    );
  }

  saveUsers(users);
}

export function resetUserPassword(target: "admin" | string) {
  const users = getStoredUsers();
  if (target === "admin") {
    users.admin = { ...users.admin, senha: DEFAULT_PASSWORD, primeiro_acesso: true };
  } else {
    users.escolas = users.escolas.map((school) =>
      school.id === target ? { ...school, senha: DEFAULT_PASSWORD, primeiro_acesso: true } : school,
    );
  }

  saveUsers(users);
}