import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, from, of } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { IndexedDbService } from '../../../core/services/indexed-db.service'
import { NetworkService } from '../../../core/services/network.service'

export interface User {
  id: string
  name: string
  lastName: string
  email: string
  phone?: string
  role: 'ADMIN' | 'OPERATOR'
  active: boolean
  createdAt: string
}

export interface UserListResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    data: User[]
    meta: {
      total: number
      page: number
      limit: number
      pages: number
    }
  }
}

export interface UserResponse {
  statusCode: number
  success: boolean
  message: string
  data: User
}

export interface CreateUserPayload {
  name: string
  lastName: string
  email: string
  phone?: string
  password: string
  role: 'ADMIN' | 'OPERATOR'
}

export interface UpdateUserPayload {
  name?: string
  lastName?: string
  phone?: string
  role?: 'ADMIN' | 'OPERATOR'
  active?: boolean
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)
  private idbService = inject(IndexedDbService)
  private networkService = inject(NetworkService)
  private apiUrl = `${environment.apiUrl}/users`

  getAll(page = 1, limit = 20, search?: string): Observable<UserListResponse> {
    if (!this.networkService.isOnline()) {
      return from(this.getAllOffline(search))
    }

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
    if (search) params = params.set('search', search)

    return new Observable(observer => {
      this.http.get<UserListResponse>(this.apiUrl, { params }).subscribe({
        next: async (res) => {
          if (res.success) {
            await this.idbService.saveUsers(res.data.data)
          }
          observer.next(res)
          observer.complete()
        },
        error: async () => {
          const offlineRes = await this.getAllOffline(search)
          observer.next(offlineRes)
          observer.complete()
        }
      })
    })
  }

  private async getAllOffline(search?: string): Promise<UserListResponse> {
    let users = await this.idbService.getUsers()

    if (search) {
      const term = search.toLowerCase()
      users = users.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      )
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Usuarios obtenidos (offline)',
      data: {
        data: users,
        meta: { total: users.length, page: 1, limit: users.length, pages: 1 },
      },
    }
  }

  getById(id: string): Observable<UserResponse> {
    if (!this.networkService.isOnline()) {
      return from(this.getByIdOffline(id))
    }
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`)
  }

  private async getByIdOffline(id: string): Promise<UserResponse> {
    const users = await this.idbService.getUsers()
    const user = users.find(u => u.id === id)

    if (!user) {
      return { statusCode: 404, success: false, message: 'Usuario no encontrado en caché', data: null as any }
    }

    return {
      statusCode: 200,
      success: true,
      message: 'Usuario obtenido (offline)',
      data: user,
    }
  }

  create(payload: CreateUserPayload): Observable<UserResponse> {
    if (!this.networkService.isOnline()) {
      return from(this.createOffline(payload))
    }
    return this.http.post<UserResponse>(this.apiUrl, payload)
  }

  private async createOffline(payload: CreateUserPayload): Promise<UserResponse> {
    const tempUser: User = {
      id: `temp_${Date.now()}`,
      name: payload.name,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      active: true,
      createdAt: new Date().toISOString(),
    }

    await this.idbService.saveUser(tempUser)
    await this.idbService.addPendingOperation({
      entity: 'users',
      operation: 'CREATE',
      payload,
    })

    return {
      statusCode: 201,
      success: true,
      message: 'Usuario guardado localmente. Se sincronizará cuando haya conexión.',
      data: tempUser,
    }
  }

  update(id: string, payload: UpdateUserPayload): Observable<UserResponse> {
    if (!this.networkService.isOnline()) {
      return from(this.updateOffline(id, payload))
    }
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, payload)
  }

  private async updateOffline(id: string, payload: UpdateUserPayload): Promise<UserResponse> {
    const users = await this.idbService.getUsers()
    const existing = users.find(u => u.id === id)

    if (!existing) {
      return { statusCode: 404, success: false, message: 'Usuario no encontrado', data: null as any }
    }

    const updated = { ...existing, ...payload }
    await this.idbService.saveUser(updated)
    await this.idbService.addPendingOperation({
      entity: 'users',
      operation: 'UPDATE',
      payload: { id, ...payload },
    })

    return {
      statusCode: 200,
      success: true,
      message: 'Usuario actualizado localmente. Se sincronizará cuando haya conexión.',
      data: updated,
    }
  }

  remove(id: string): Observable<UserResponse> {
    if (!this.networkService.isOnline()) {
      return from(this.removeOffline(id))
    }
    return this.http.delete<UserResponse>(`${this.apiUrl}/${id}`)
  }

  private async removeOffline(id: string): Promise<UserResponse> {
    await this.idbService.deleteUserLocal(id)
    await this.idbService.addPendingOperation({
      entity: 'users',
      operation: 'DELETE',
      payload: { id },
    })

    return {
      statusCode: 200,
      success: true,
      message: 'Usuario eliminado localmente. Se sincronizará cuando haya conexión.',
      data: null as any,
    }
  }
}
