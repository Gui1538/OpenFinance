/**
 * Versão web do banco local (o Metro escolhe este arquivo no lugar de database.ts na web).
 * Mantém o mesmo contrato do SQLite usando localStorage, para o app continuar funcionando no navegador.
 */
import type { BaseRecord, CollectionName } from '@/types';
import type { LocalDB, NewQueueItem, QueueItem } from './database.types';

type Row = BaseRecord;

interface Store {
  rows: Record<CollectionName, Row[]>;
  queue: QueueItem[];
  queueSeq: number;
  cache: Record<string, string>;
}

const KEY = 'openfinance.localdb.v2';
const empty = (): Store => ({
  rows: { categories: [], expenses: [], revenues: [] },
  queue: [],
  queueSeq: 0,
  cache: {},
});

let memory: Store | null = null;

function load(): Store {
  if (memory) return memory;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
    memory = raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    memory = empty();
  }
  return memory!;
}

function save() {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    /* sem espaço / modo privado: segue só em memória */
  }
}

export const localDB: LocalDB = {
  async init() {
    load();
  },

  async list<T extends BaseRecord>(collection: CollectionName, uid: string) {
    return load().rows[collection]
      .filter((r) => r.usuarioId === uid)
      .sort((a, b) => b.createdAt - a.createdAt) as unknown as T[];
  },

  async get<T extends BaseRecord>(collection: CollectionName, uid: string, id: string) {
    const row = load().rows[collection].find((r) => r.usuarioId === uid && r.id === id);
    return (row as unknown as T) ?? null;
  },

  async upsert<T extends BaseRecord>(collection: CollectionName, uid: string, record: T) {
    const rows = load().rows[collection];
    const i = rows.findIndex((r) => r.usuarioId === uid && r.id === record.id);
    const next = { ...record, usuarioId: uid } as Row;
    if (i >= 0) rows[i] = next;
    else rows.push(next);
    save();
  },

  async upsertMany<T extends BaseRecord>(collection: CollectionName, uid: string, records: T[]) {
    for (const r of records) await this.upsert(collection, uid, r);
  },

  async remove(collection, uid, id) {
    const s = load();
    s.rows[collection] = s.rows[collection].filter((r) => !(r.usuarioId === uid && r.id === id));
    save();
  },

  async enqueue(item: NewQueueItem) {
    const s = load();
    s.queue = s.queue.filter(
      (q) => !(q.uid === item.uid && q.collection === item.collection && q.docId === item.docId),
    );
    s.queue.push({ ...item, id: ++s.queueSeq, createdAt: Date.now() });
    save();
  },

  async getQueue(uid) {
    return load()
      .queue.filter((q) => q.uid === uid)
      .sort((a, b) => a.id - b.id);
  },

  async removeFromQueue(id) {
    const s = load();
    s.queue = s.queue.filter((q) => q.id !== id);
    save();
  },

  async countQueue(uid) {
    return load().queue.filter((q) => q.uid === uid).length;
  },

  async getCache(key) {
    return load().cache[key] ?? null;
  },

  async setCache(key, value) {
    load().cache[key] = value;
    save();
  },
};
