import { Injectable } from '@angular/core'

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'auth_user',
} as const

@Injectable({ providedIn: 'root' })
export class StorageService {

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken)
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken)
  }

  getAccessToken(): string | null {
    return localStorage.getItem(KEYS.ACCESS_TOKEN)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.REFRESH_TOKEN)
  }

  setUser(user: object): void {
    localStorage.setItem(KEYS.USER, JSON.stringify(user))
  }

  getUser<T>(): T | null {
    const raw = localStorage.getItem(KEYS.USER)
    if (!raw) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  }

  clear(): void {
    localStorage.removeItem(KEYS.ACCESS_TOKEN)
    localStorage.removeItem(KEYS.REFRESH_TOKEN)
    localStorage.removeItem(KEYS.USER)
  }
}
