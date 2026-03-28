import { Injectable } from '@angular/core'
import { openDB, IDBPDatabase } from 'idb'

export interface PendingOperation {
  id?: number
  entity: string
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  payload: any
  createdAt: Date
  attempts: number
}

const DB_NAME = 'renta-internet-db'
const DB_VERSION = 1

const STORES = {
  USERS: 'users',
  PENDING_OPS: 'pending_operations',
} as const

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private db!: IDBPDatabase

  async init(): Promise<void> {
    try {
      this.db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Store de usuarios cacheados
          if (!db.objectStoreNames.contains(STORES.USERS)) {
            const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' })
            userStore.createIndex('email', 'email', { unique: true })
          }

          // Store de operaciones pendientes
          if (!db.objectStoreNames.contains(STORES.PENDING_OPS)) {
            const opsStore = db.createObjectStore(STORES.PENDING_OPS, {
              keyPath: 'id',
              autoIncrement: true,
            })
            opsStore.createIndex('entity', 'entity')
            opsStore.createIndex('createdAt', 'createdAt')
          }
        },
      })
    } catch (error) {
      console.error('Error al inicializar IndexedDB:', error)
    }
  }

  // ─── Usuarios ──────────────────────────────────────────────
  async saveUsers(users: any[]): Promise<void> {
    const tx = this.db.transaction(STORES.USERS, 'readwrite')
    await Promise.all([
      ...users.map(user => tx.store.put(user)),
      tx.done,
    ])
  }

  async getUsers(): Promise<any[]> {
    return this.db.getAll(STORES.USERS)
  }

  async saveUser(user: any): Promise<void> {
    await this.db.put(STORES.USERS, user)
  }

  async deleteUserLocal(id: string): Promise<void> {
    await this.db.delete(STORES.USERS, id)
  }

  // ─── Operaciones pendientes ────────────────────────────────
  async addPendingOperation(op: Omit<PendingOperation, 'id' | 'attempts' | 'createdAt'>): Promise<void> {
    await this.db.add(STORES.PENDING_OPS, {
      ...op,
      attempts: 0,
      createdAt: new Date(),
    })
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    return this.db.getAll(STORES.PENDING_OPS)
  }

  async deletePendingOperation(id: number): Promise<void> {
    await this.db.delete(STORES.PENDING_OPS, id)
  }

  async incrementAttempts(id: number): Promise<void> {
    const op = await this.db.get(STORES.PENDING_OPS, id)
    if (op) {
      await this.db.put(STORES.PENDING_OPS, { ...op, attempts: op.attempts + 1 })
    }
  }

  async clearPendingOperations(): Promise<void> {
    await this.db.clear(STORES.PENDING_OPS)
  }
}
