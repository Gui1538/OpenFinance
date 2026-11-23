/**
 * Esquema do SQLite. Sem imports de propósito (puro SQL em string) para poder ser testado fora do app.
 *
 * Regras de negócio garantidas pelo próprio banco:
 *  - toda despesa tem categoria (categoriaId NOT NULL + FOREIGN KEY);
 *  - uma categoria com despesas não pode ser apagada (ON DELETE RESTRICT);
 *  - nome/descricao obrigatórios, descricao com no máximo 500 caracteres, valor > 0, tipo restrito.
 */
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT NOT NULL,
  usuarioId TEXT NOT NULL,
  nome TEXT NOT NULL CHECK (length(trim(nome)) BETWEEN 1 AND 30),
  tipo TEXT NOT NULL CHECK (tipo IN ('essencial', 'nao_essencial')),
  descricao TEXT NOT NULL CHECK (length(trim(descricao)) BETWEEN 1 AND 500),
  icone TEXT NOT NULL,
  cor TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  PRIMARY KEY (usuarioId, id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT NOT NULL,
  usuarioId TEXT NOT NULL,
  categoriaId TEXT NOT NULL,
  nome TEXT NOT NULL CHECK (length(trim(nome)) BETWEEN 1 AND 60),
  tipo TEXT NOT NULL CHECK (tipo IN ('fixa', 'variavel')),
  descricao TEXT NOT NULL CHECK (length(trim(descricao)) BETWEEN 1 AND 500),
  valor REAL NOT NULL CHECK (valor > 0),
  data TEXT NOT NULL CHECK (data GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  PRIMARY KEY (usuarioId, id),
  FOREIGN KEY (usuarioId, categoriaId) REFERENCES categories (usuarioId, id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_expenses_data ON expenses (usuarioId, data);
CREATE INDEX IF NOT EXISTS idx_expenses_categoria ON expenses (usuarioId, categoriaId);

CREATE TABLE IF NOT EXISTS revenues (
  id TEXT NOT NULL,
  usuarioId TEXT NOT NULL,
  nome TEXT NOT NULL CHECK (length(trim(nome)) BETWEEN 1 AND 60),
  tipo TEXT NOT NULL CHECK (tipo IN ('salario', 'venda', 'presente', 'investimento', 'outros')),
  descricao TEXT NOT NULL CHECK (length(trim(descricao)) BETWEEN 1 AND 500),
  valor REAL NOT NULL CHECK (valor > 0),
  data TEXT NOT NULL CHECK (data GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  PRIMARY KEY (usuarioId, id)
);
CREATE INDEX IF NOT EXISTS idx_revenues_data ON revenues (usuarioId, data);

CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  collection TEXT NOT NULL,
  docId TEXT NOT NULL,
  op TEXT NOT NULL CHECK (op IN ('set', 'delete')),
  payload TEXT,
  createdAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_queue_uid ON sync_queue (uid, id);

CREATE TABLE IF NOT EXISTS cache (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  updatedAt INTEGER NOT NULL
);
`;
