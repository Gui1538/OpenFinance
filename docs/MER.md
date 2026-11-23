# MER — OpenFinance

```mermaid
erDiagram
    USUARIO ||--o{ CATEGORIA : "cria"
    USUARIO ||--o{ DESPESA   : "registra"
    USUARIO ||--o{ RECEITA   : "registra"
    CATEGORIA ||--o{ DESPESA : "classifica"

    USUARIO {
        string id PK "alfanumérico (uid do Firebase Auth)"
        string nome "NOT NULL"
        date   data_de_nascimento "NOT NULL (maior de 18)"
        string email "NOT NULL, único (Auth)"
        string senha "NOT NULL, PRIVADA: só hash no Firebase Auth"
        string telefone "extra"
        string cpf "extra, validado"
        string cep "extra"
    }
    CATEGORIA {
        string id PK "alfanumérico"
        string usuario_id FK "NOT NULL"
        string nome "NOT NULL, até 30"
        string tipo "NOT NULL: essencial | nao_essencial"
        string descricao "NOT NULL, VARCHAR(500)"
        string icone "visual"
        string cor "visual"
    }
    DESPESA {
        string id PK "alfanumérico"
        string usuario_id FK "NOT NULL"
        string categoria_id FK "NOT NULL (despesa precisa de categoria)"
        string nome "NOT NULL, até 60"
        string tipo "NOT NULL: fixa | variavel"
        string descricao "NOT NULL, VARCHAR(500)"
        decimal valor "NOT NULL, > 0"
        date data "NOT NULL"
    }
    RECEITA {
        string id PK "alfanumérico"
        string usuario_id FK "NOT NULL"
        string nome "NOT NULL, até 60"
        string tipo "NOT NULL: salario | venda | presente | investimento | outros"
        string descricao "NOT NULL, VARCHAR(500)"
        decimal valor "NOT NULL, > 0"
        date data "NOT NULL"
    }
```

## Cardinalidades e regras de negócio
| Regra | Onde é garantida |
|---|---|
| Uma despesa tem **exatamente uma** categoria; uma categoria tem **várias** despesas | `categoriaId NOT NULL` + `FOREIGN KEY` (SQLite), `exists(...)` (regras Firestore), validação na tela |
| Categoria com despesas **não pode ser excluída** | `ON DELETE RESTRICT` (SQLite) + checagem em `deleteCategory` |
| Um usuário tem **várias** categorias, despesas e receitas, e só vê as suas | caminho `users/{uid}/...` + regras Firestore + coluna `usuarioId` |
| `nome`, `tipo`, `descricao` obrigatórios; `descricao` até **500** caracteres | `CHECK` (SQLite), regras Firestore, validação + contador na tela |
| `valor > 0`, `data` válida (YYYY-MM-DD) | `CHECK` (SQLite), regras Firestore, validação |
| **Senha privada** | Nunca é gravada no SQLite nem no Firestore; o Firebase Auth guarda só o hash |
| ID alfanumérico | `newId()` (offline) / `uid` do Auth (usuário) |

> `usuario_id`/`categoria_id` aparecem no diagrama em snake_case; no código são `usuarioId`/`categoriaId`.
