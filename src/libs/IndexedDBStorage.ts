import { logger } from './Logger';

/**
 * Gerenciamento de storage persistente usando IndexedDB (Versão TS)
 */
export class IndexedDBStorage<T> {
  static DB_NAME = 'AuraStorage';
  static DB_VERSION = 1;
  static STORE_NAME = 'keyValueStore';

  private _initialized = false;
  private _value: T;

  constructor(
    private key: string,
    private initialValue: T,
  ) {
    this._value = initialValue;
  }

  async initialize(): Promise<void> {
    if (this._initialized) return;
    try {
      const stored = await this._readFromDB(this.key);
      if (stored !== null) {
        this._value = stored as T;
      } else {
        await this._writeToDB(this.key, this.initialValue);
      }
      this._initialized = true;
    } catch (err) {
      logger.error('Storage', `Falha ao inicializar: ${err}`);
      throw err;
    }
  }

  getValue(): T {
    return this._value;
  }

  async setValue(newValue: T | ((prev: T) => T)): Promise<void> {
    const valueToStore =
      typeof newValue === 'function'
        ? (newValue as Function)(this._value)
        : newValue;

    this._value = valueToStore;
    await this._writeToDB(this.key, valueToStore);
  }

  async setOther(key: string, value: any): Promise<void> {
    await this._writeToDB(key, value);
  }

  async getOther(key: string): Promise<any> {
    return await this._readFromDB(key);
  }

  private async _openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        IndexedDBStorage.DB_NAME,
        IndexedDBStorage.DB_VERSION,
      );
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IndexedDBStorage.STORE_NAME)) {
          db.createObjectStore(IndexedDBStorage.STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async _readFromDB(key: string): Promise<any> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [IndexedDBStorage.STORE_NAME],
        'readonly',
      );
      const store = transaction.objectStore(IndexedDBStorage.STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  private async _writeToDB(key: string, value: any): Promise<void> {
    const db = await this._openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [IndexedDBStorage.STORE_NAME],
        'readwrite',
      );
      const store = transaction.objectStore(IndexedDBStorage.STORE_NAME);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
