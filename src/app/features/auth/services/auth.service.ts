import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    user: {
      id: string
      name: string
      lastName: string
      email: string
      role: string
    }
    accessToken: string
    refreshToken: string
  }
}

export interface RefreshResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload)
  }

  refresh(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, { refreshToken })
  }
}
