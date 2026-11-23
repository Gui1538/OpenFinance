# Banco de dados do OpenFinance

O app é **offline-first**: tudo é gravado primeiro no **SQLite** do aparelho e, quando há internet,
enviado ao **Cloud Firestore** (projeto `openfinance-6a44a`). No Firestore não existem "tabelas" criadas
antes: as coleções passam a existir quando o primeiro documento é gravado. O app faz isso sozinho
no cadastro (perfil + categorias padrão). O que você precisa publicar são as **regras** (`firestore.rules`).

## Estrutura no Firestore (modelo completo em `docs/MER.md`)

```
users/{uid}                      ← Usuário (criado no cadastro)
  id, nome, dataNascimento ("YYYY-MM-DD"), email, telefone, cpf, cep,
  provider ("password" | "google"), createdAt, updatedAt        (senha: só no Firebase Auth)

users/{uid}/categories/{id}      ← Categoria (6 padrão criadas no cadastro)
  usuarioId, nome, tipo ("essencial"|"nao_essencial"), descricao (1..500), icone, cor, createdAt, updatedAt

users/{uid}/expenses/{id}        ← Despesa
  usuarioId, categoriaId (obrigatório, FK), nome, tipo ("fixa"|"variavel"), descricao (1..500),
  valor (number > 0), data ("YYYY-MM-DD"), createdAt, updatedAt

users/{uid}/revenues/{id}        ← Receita
  usuarioId, nome, tipo ("salario"|"venda"|"presente"|"investimento"|"outros"), descricao (1..500),
  valor (number > 0), data ("YYYY-MM-DD"), createdAt, updatedAt
```

Categorias padrão (IDs fixos `default-<chave>`): Alimentação, Transporte, Moradia, Saúde e Educação (essenciais) e Lazer (não essencial).

## Estrutura no SQLite (`openfinance.v2.db`) — esquema em `src/services/schema.ts`

| Tabela        | Colunas / restrições                                                                                         |
|---------------|--------------------------------------------------------------------------------------------------------------|
| `categories`  | id, usuarioId, nome, tipo, descricao, icone, cor, createdAt, updatedAt — PK (usuarioId, id)                  |
| `expenses`    | id, usuarioId, **categoriaId NOT NULL**, nome, tipo, descricao, valor, data, createdAt, updatedAt — PK (usuarioId, id), **FK → categories ON DELETE RESTRICT** |
| `revenues`    | id, usuarioId, nome, tipo, descricao, valor, data, createdAt, updatedAt — PK (usuarioId, id)                 |
| `sync_queue`  | id, uid, collection, docId, op (`set`/`delete`), payload (JSON), createdAt                                   |
| `cache`       | key, value, updatedAt — última cotação de moedas/investimentos para uso offline                              |

Todas as tabelas de dados têm `CHECK` para nome/descrição (1..500), tipo permitido, `valor > 0` e `data` no formato ISO.

## Como a sincronização funciona

1. Criar/editar/excluir grava no SQLite e coloca uma entrada em `sync_queue` (alterações no mesmo documento são fundidas).
2. Com internet, o `SyncProvider` envia a fila ao Firestore **respeitando a dependência**: categorias primeiro, depois despesas/receitas; nas exclusões, despesas antes das categorias. Sem internet, ela espera.
3. Ao reconectar, a fila é enviada e a tela **Sincronização** é exibida. Depois o app baixa as novidades da nuvem
   (o que foi alterado em outro aparelho) sem sobrescrever alterações ainda pendentes. Em conflito vale o `updatedAt` mais recente.

## Passos no Console do Firebase

1. **Authentication → Sign-in method**: ative **E-mail/senha** (e **Google**, se for usar na web).
2. **Authentication → Settings → Authorized domains**: confirme `localhost` (e seu domínio, se publicar).
3. **Firestore**: publique as regras do repositório:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,firestore:indexes
   ```
   (`firebase.json` e `.firebaserc` já apontam para `openfinance-6a44a`.)
4. Crie uma conta pelo app: o perfil e as categorias padrão aparecem em `users/{uid}` no Console.

## APIs de mercado (tela Cotações)

- **AwesomeAPI** (sem chave): USD, EUR, BTC e ETH em reais.
- **brapi.dev**: PETR4, VALE3, ITUB4 e MGLU3 (funcionam sem token). Para outros tickers, crie um token e
  defina `EXPO_PUBLIC_BRAPI_TOKEN` em um arquivo `.env`.
