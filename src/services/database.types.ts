import type { BaseRecord, CollectionName } from '@/types';

export type SyncOp = 'set' | 'delete';

export interface QueueItem {
  id: number;
  uid: string;
  collection: CollectionName;
  docId: string;
  op: SyncOp;
  /** JSON do documento (null quando op = delete) */
  payload: string | null;
  createdAt: number;
}

export type NewQueueItem = Omit<QueueItem, 'id' | 'createdAt'>;

/** Colunas específicas de cada tabela (além de id, usuarioId, createdAt e updatedAt). */
export const COLLECTION_COLUMNS: Record<CollectionName, { name: string; type: 'TEXT' | 'REAL' }[]> = {
  categories: [
    { name: 'nome', type: 'TEXT' },
    { name: 'tipo', type: 'TEXT' },
    { name: 'descricao', type: 'TEXT' },
    { name: 'icone', type: 'TEXT' },
    { name: 'cor', type: 'TEXT' },
  ],
  expenses: [
    { name: 'categoriaId', type: 'TEXT' },
    { name: 'nome', type: 'TEXT' },
    { name: 'tipo', type: 'TEXT' },
    { name: 'descricao', type: 'TEXT' },
    { name: 'valor', type: 'REAL' },
    { name: 'data', type: 'TEXT' },
  ],
  revenues: [
    { name: 'nome', type: 'TEXT' },
    { name: 'tipo', type: 'TEXT' },
    { name: 'descricao', type: 'TEXT' },
    { name: 'valor', type: 'REAL' },
    { name: 'data', type: 'TEXT' },
  ],
};

/** Contrato do banco local (SQLite no celular, localStorage na web). */
export interface LocalDB {
  init(): Promise<void>;
  list<T extends BaseRecord>(collection: CollectionName, uid: string): Promise<T[]>;
  get<T extends BaseRecord>(collection: CollectionName, uid: string, id: string): Promise<T | null>;
  upsert<T extends BaseRecord>(collection: CollectionName, uid: string, record: T): Promise<void>;
  upsertMany<T extends BaseRecord>(collection: CollectionName, uid: string, records: T[]): Promise<void>;
  remove(collection: CollectionName, uid: string, id: string): Promise<void>;

  /** Fila de operações pendentes de envio ao Firestore. Operações no mesmo documento são fundidas (vale a última). */
  enqueue(item: NewQueueItem): Promise<void>;
  getQueue(uid: string): Promise<QueueItem[]>;
  removeFromQueue(id: number): Promise<void>;
  countQueue(uid: string): Promise<number>;

  getCache(key: string): Promise<string | null>;
  setCache(key: string, value: string): Promise<void>;
}
