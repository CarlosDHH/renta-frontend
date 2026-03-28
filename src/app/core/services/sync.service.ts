import { Injectable, inject, effect } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { firstValueFrom } from 'rxjs'
import { environment } from '../../../environments/environment'
import { IndexedDbService, PendingOperation } from './indexed-db.service'
import { NetworkService } from './network.service'

const MAX_ATTEMPTS = 3

@Injectable({ providedIn: 'root' })
export class SyncService {
  private http = inject(HttpClient)
  private idbService = inject(IndexedDbService)
  private networkService = inject(NetworkService)

  isSyncing = false

  startListening(): void {
    window.addEventListener('online', () => {
      this.syncPendingOperations()
    })
  }

  async syncPendingOperations(): Promise<void> {
    if (this.isSyncing) return
    this.isSyncing = true

    try {
      const pending = await this.idbService.getPendingOperations()
      if (pending.length === 0) return

      console.log(`Sincronizando ${pending.length} operaciones pendientes...`)

      for (const op of pending) {
        await this.processOperation(op)
      }
    } catch (error) {
      console.error('Error durante sincronización:', error)
    } finally {
      this.isSyncing = false
    }
  }

  private async processOperation(op: PendingOperation): Promise<void> {
    if (op.attempts >= MAX_ATTEMPTS) {
      console.warn(`Operación ${op.id} superó el máximo de intentos, descartando`)
      await this.idbService.deletePendingOperation(op.id!)
      return
    }

    try {
      await this.executeOperation(op)
      await this.idbService.deletePendingOperation(op.id!)
      console.log(`Operación ${op.id} sincronizada`)
    } catch (error) {
      await this.idbService.incrementAttempts(op.id!)
      console.error(`Error al sincronizar operación ${op.id}:`, error)
    }
  }

  private async executeOperation(op: PendingOperation): Promise<void> {
    const url = `${environment.apiUrl}/${op.entity}`

    switch (op.operation) {
      case 'CREATE':
        await firstValueFrom(this.http.post(url, op.payload))
        break
      case 'UPDATE':
        await firstValueFrom(this.http.put(`${url}/${op.payload.id}`, op.payload))
        break
      case 'DELETE':
        await firstValueFrom(this.http.delete(`${url}/${op.payload.id}`))
        break
    }
  }
}
