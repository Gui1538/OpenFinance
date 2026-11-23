import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import type { BaseRecord, CollectionName } from '@/types';
import { localDB } from './database';
import type { QueueItem } from './database.types';
import { db } from './firebase';

const COLLECTIONS: CollectionName[] = ['categories', 'expenses', 'revenues'];
const NETWORK_TIMEOUT_MS = 15000;

export interface SyncResult {
  pushed: number;
  failed: number;
  pulled: number;
  error?: string;
}

/* ---------- Pequeno "event bus": avisa o SyncProvider quando algo muda localmente ---------- */
const listeners = new Set<() => void>();
export function subscribeLocalChange(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
export function notifyLocalChange() {
  listeners.forEach((cb) => cb());
}

function withTimeout<T>(p: Promise<T>, ms = NETWORK_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('Tempo esgotado ao falar com o servidor.')), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

const isNetworkError = (e: unknown) => {
  const code = (e as { code?: string })?.code;
  return code === 'unavailable' || (e instanceof Error && e.message.startsWith('Tempo esgotado'));
};

/**
 * Ordem de envio respeitando a regra "despesa precisa de categoria":
 * 1) categorias criadas/editadas, 2) despesas e receitas, 3) exclusões de despesas/receitas, 4) exclusões de categorias.
 */
const rank = (q: QueueItem) =>
  q.op === 'set' ? (q.collection === 'categories' ? 0 : 1) : q.collection === 'categories' ? 3 : 2;

/** Envia ao Firestore tudo que foi gravado offline. */
export async function pushQueue(uid: string): Promise<{ pushed: number; failed: number; error?: string }> {
  const queue = (await localDB.getQueue(uid)).sort((a, b) => rank(a) - rank(b) || a.id - b.id);
  let pushed = 0;
  let failed = 0;
  let error: string | undefined;

  for (const item of queue) {
    try {
      const ref = doc(db, 'users', uid, item.collection, item.docId);
      if (item.op === 'delete') await withTimeout(deleteDoc(ref));
      else await withTimeout(setDoc(ref, JSON.parse(item.payload ?? '{}')));
      await localDB.removeFromQueue(item.id);
      pushed++;
    } catch (e) {
      failed++;
      error = e instanceof Error ? e.message : String(e);
      if (isNetworkError(e)) break; // sem rede: para e tenta tudo de novo depois
      // outro erro (ex.: regra recusou): segue com os demais; este item fica na fila
    }
  }
  return { pushed, failed, error };
}

/** Baixa o que existe no Firestore e atualiza o SQLite (sem sobrescrever o que ainda está pendente). */
export async function pullRemote(uid: string): Promise<number> {
  const pendingKeys = new Set((await localDB.getQueue(uid)).map((q) => `${q.collection}/${q.docId}`));
  let pulled = 0;

  // 1) baixa tudo antes de mexer no SQLite (falha de rede não deixa dados pela metade)
  const remoteBy = {} as Record<CollectionName, BaseRecord[]>;
  for (const name of COLLECTIONS) {
    const snap = await withTimeout(getDocs(collection(db, 'users', uid, name)));
    remoteBy[name] = snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as BaseRecord);
  }

  // 2) grava na ordem de dependência: categorias antes das despesas (FK)
  for (const name of COLLECTIONS) {
    const local = await localDB.list<BaseRecord>(name, uid);
    const localById = new Map(local.map((r) => [r.id, r]));
    const toSave = remoteBy[name].filter((r) => {
      if (pendingKeys.has(`${name}/${r.id}`)) return false;
      const l = localById.get(r.id);
      return !l || (r.updatedAt ?? 0) >= l.updatedAt;
    });
    await localDB.upsertMany(name, uid, toSave);
    pulled += toSave.length;
  }

  // 3) remove o que sumiu da nuvem, em ordem inversa (despesas antes das categorias)
  for (const name of [...COLLECTIONS].reverse()) {
    const remoteIds = new Set(remoteBy[name].map((r) => r.id));
    for (const l of await localDB.list<BaseRecord>(name, uid)) {
      if (remoteIds.has(l.id) || pendingKeys.has(`${name}/${l.id}`)) continue;
      try {
        await localDB.remove(name, uid, l.id);
      } catch {
        // Categoria apagada em outro aparelho, mas aqui ainda tem despesa nova (FK RESTRICT):
        // recria a categoria na nuvem para a despesa não ficar órfã.
        await localDB.enqueue({ uid, collection: name, docId: l.id, op: 'set', payload: JSON.stringify(l) });
      }
    }
  }
  return pulled;
}

let running: Promise<SyncResult> | null = null;

/** Sincronização completa: primeiro sobe o pendente, depois baixa as novidades. */
export function syncAll(uid: string): Promise<SyncResult> {
  if (running) return running;
  running = (async () => {
    const push = await pushQueue(uid);
    if (push.failed > 0) return { pushed: push.pushed, failed: push.failed, pulled: 0, error: push.error };
    try {
      const pulled = await pullRemote(uid);
      return { pushed: push.pushed, failed: 0, pulled };
    } catch (e) {
      return {
        pushed: push.pushed,
        failed: 0,
        pulled: 0,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  })().finally(() => {
    running = null;
  });
  return running;
}
