# FinanceApp (OpenFinance)

App Expo / React Native de controle financeiro, **offline-first**: SQLite no aparelho + Firebase (Auth e Firestore) na nuvem.

## Rodar

```bash
npm install
npx expo start        # a: Android · i: iOS · w: web
```

Antes do primeiro uso, siga os passos de `docs/FIRESTORE.md` (ativar login por e-mail no Firebase e publicar as regras).

## Arquitetura

```
src/app/            rotas finas (só importam a tela da feature) + guard de login em _layout.tsx
  index.tsx           tela inicial          (auth)/Login, Register
  (tabs)/             Home, Expenses, Revenue, Category, Investimentos
  ExpenseForm · RevenueForm · CategoryForm · Sync
src/features/<nome>/
  <Tela>.tsx          interface
  Use<Nome>.ts        hook: estado, validação, navegação, feedback
  <Nome>API.ts        acesso a dados / regras (SQLite, Firestore, APIs externas)
src/services/       firebase · database (SQLite; .web.ts usa localStorage) · sync · repository · userProfile
src/providers/      Auth · Feedback (telas de sucesso/erro) · Sync (conexão, fila, modo offline)
src/components/ui.tsx  componentes compartilhados
```

Fluxo de navegação: **Início ⇄ Login ⇄ Cadastro** (botões de voltar em cada tela). Ao entrar, o usuário vai para as abas;
ao sair, volta para a tela inicial.
