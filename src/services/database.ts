import * as SQLite from 'expo-sqlite';
import type { BaseRecord, CollectionName } from '@/types';
import { SCHEMA_SQL } from './schema';
import {
  COLLECTION_COLUMNS,
  type LocalDB,
  type NewQueueItem,
  type QueueItem,
} from './database.types';

const DB_NAME = 'openfinance.v2.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync(SCHEMA_SQL); // inclui PRAGMA foreign_keys = ON
  return db;
}

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = open().catch((e) => {
      dbPromise = null;
      throw e;
    });
  }
  return dbPromise;
}

function upsertSql(collection: CollectionName) {
  const cols = COLLECTION_COLUMNS[collection].map((c) => c.name);
  const all = ['id', 'usuarioId', ...cols, 'createdAt', 'updatedAt'];
  const updates = [...cols, 'updatedAt'].map((c) => `${c} = excluded.${c}`).join(', ');
  const sql = `INSERT INTO ${collection} (${all.join(', ')}) VALUES (${all.map(() => '?').join(', ')})
    ON CONFLICT (usuarioId, id) DO UPDATE SET ${updates}`;
  return { sql, cols };
}

function toParams(cols: string[], uid: string, record: BaseRecord): (string | number)[] {
  const r = record as unknown as Record<string, string | number>;
  return [record.id, uid, ...cols.map((c) => r[c]), record.createdAt, record.updatedAt];
}

export const localDB: LocalDB = {
  async init() {
    await getDb();
  },

  async list<T extends BaseRecord>(collection: CollectionName, uid: string) {
    const db = await getDb();
    return db.getAllAsync<T>(`SELECT * FROM ${collection} WHERE usuarioId = ? ORDER BY createdAt DESC`, [uid]);
  },

  async get<T extends BaseRecord>(collection: CollectionName, uid: string, id: string) {
    const db = await getDb();
    return (await db.getFirstAsync<T>(`SELECT * FROM ${collection} WHERE usuarioId = ? AND id = ?`, [uid, id])) ?? null;
  },

  async upsert<T extends BaseRecord>(collection: CollectionName, uid: string, record: T) {
    const db = await getDb();
    const { sql, cols } = upsertSql(collection);
    await db.runAsync(sql, toParams(cols, uid, record));
  },

  async upsertMany<T extends BaseRecord>(collection: CollectionName, uid: string, records: T[]) {
    if (!records.length) return;
    const db = await getDb();
    const { sql, cols } = upsertSql(collection);
    await db.withTransactionAsync(async () => {
      for (const r of records) await db.runAsync(sql, toParams(cols, uid, r));
    });
  },

  async remove(collection, uid, id) {
    const db = await getDb();
    await db.runAsync(`DELETE FROM ${collection} WHERE usuarioId = ? AND id = ?`, [uid, id]);
  },

  async enqueue(item: NewQueueItem) {
    const db = await getDb();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM sync_queue WHERE uid = ? AND collection = ? AND docId = ?', [
        item.uid,
        item.collection,
        item.docId,
      ]);
      await db.runAsync(
        'INSERT INTO sync_queue (uid, collection, docId, op, payload, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [item.uid, item.collection, item.docId, item.op, item.payload, Date.now()],
      );
    });
  },

  async getQueue(uid) {
    const db = await getDb();
    return db.getAllAsync<QueueItem>('SELECT * FROM sync_queue WHERE uid = ? ORDER BY id ASC', [uid]);
  },

  async removeFromQueue(id) {
    const db = await getDb();
    await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  },

  async countQueue(uid) {
    const db = await getDb();
    const row = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM sync_queue WHERE uid = ?', [uid]);
    return row?.n ?? 0;
  },

  async getCache(key) {
    const db = await getDb();
    const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM cache WHERE key = ?', [key]);
    return row?.value ?? null;
  },

  async setCache(key, value) {
    const db = await getDb();
    await db.runAsync('INSERT OR REPLACE INTO cache (key, value, updatedAt) VALUES (?, ?, ?)', [key, value, Date.now()]);
  },
};
