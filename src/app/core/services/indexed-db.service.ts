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
const DB_VERSION = 2  // ← incrementamos la versión para que upgrade() se ejecute

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
        // upgrade(db, oldVersion) {
        //   // Si es la primera vez
        //   if (oldVersion < 1) {
        //     const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' })
        //     userStore.createIndex('email', 'email') // sin unique

        //     const opsStore = db.createObjectStore(STORES.PENDING_OPS, {
        //       keyPath: 'id',
        //       autoIncrement: true,
        //     })
        //     opsStore.createIndex('entity', 'entity')
        //     opsStore.createIndex('createdAt', 'createdAt')
        //   }

        //   // Migración de v1 a v2 — elimina el índice único de email
        //   if (oldVersion === 1) {
        //     const userStore = db.transaction.objectStore(STORES.USERS)
        //     if (userStore.indexNames.contains('email')) {
        //       userStore.deleteIndex('email')
        //       userStore.createIndex('email', 'email') // sin unique
        //     }
        //   }
        // },
        upgrade(db, oldVersion, newVersion, transaction) {
          if (oldVersion < 1) {
            const userStore = db.createObjectStore(STORES.USERS, { keyPath: 'id' })
            userStore.createIndex('email', 'email')

            const opsStore = db.createObjectStore(STORES.PENDING_OPS, {
              keyPath: 'id',
              autoIncrement: true,
            })
            opsStore.createIndex('entity', 'entity')
            opsStore.createIndex('createdAt', 'createdAt')
          }

          if (oldVersion === 1) {
            const userStore = transaction.objectStore(STORES.USERS)
            if (userStore.indexNames.contains('email')) {
              userStore.deleteIndex('email')
              userStore.createIndex('email', 'email')
            }
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
      ...users.map(user => tx.store.put({ ...user, synced: true })),
      tx.done,
    ])
  }

  async getUsers(): Promise<any[]> {
    return this.db.getAll(STORES.USERS)
  }

  async saveUser(user: any): Promise<void> {
    await this.db.put(STORES.USERS, user)
  }

  async clearUsers(): Promise<void> {
    await this.db.clear(STORES.USERS)
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
