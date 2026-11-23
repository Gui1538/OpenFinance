import type { BaseRecord, CollectionName } from '@/types';
import { newId } from '@/utils/format';
import { localDB } from './database';
import { notifyLocalChange } from './sync';

type Data<T extends BaseRecord> = Omit<T, keyof BaseRecord>;

/**
 * Repositório "offline-first": toda escrita vai primeiro para o SQLite e entra na fila de sincronização.
 * O SyncProvider envia a fila ao Firestore assim que houver internet.
 * `usuarioId` (FK para o dono) é sempre preenchido aqui, nunca pela tela.
 */
export function createRepository<T extends BaseRecord>(collection: CollectionName) {
  return {
    list: (uid: string) => localDB.list<T>(collection, uid),

    get: (uid: string, id: string) => localDB.get<T>(collection, uid, id),

    async create(uid: string, data: Data<T>, id: string = newId()): Promise<T> {
      const now = Date.now();
      const record = { ...data, id, usuarioId: uid, createdAt: now, updatedAt: now } as T;
      await localDB.upsert(collection, uid, record);
      await localDB.enqueue({ uid, collection, docId: id, op: 'set', payload: JSON.stringify(record) });
      notifyLocalChange();
      return record;
    },

    async update(uid: string, id: string, patch: Partial<Data<T>>): Promise<T> {
      const current = await localDB.get<T>(collection, uid, id);
      if (!current) throw new Error('Registro não encontrado.');
      const record = { ...current, ...patch, id, usuarioId: uid, updatedAt: Date.now() } as T;
      await localDB.upsert(collection, uid, record);
      await localDB.enqueue({ uid, collection, docId: id, op: 'set', payload: JSON.stringify(record) });
      notifyLocalChange();
      return record;
    },

    async remove(uid: string, id: string): Promise<void> {
      await localDB.remove(collection, uid, id);
      await localDB.enqueue({ uid, collection, docId: id, op: 'delete', payload: null });
      notifyLocalChange();
    },
  };
}
