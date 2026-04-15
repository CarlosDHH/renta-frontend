import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'

export interface Plan {
  id: string
  name: string
  mbps: number
  price: number
  description?: string
  active: boolean
}

export interface PlanListResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    data: Plan[]
    meta: { total: number; page: number; limit: number; pages: number }
  }
}

export interface PlanResponse {
  statusCode: number
  success: boolean
  message: string
  data: Plan
}

export interface CreatePlanPayload {
  name: string
  mbps: number
  price: number
  description?: string
}

export interface UpdatePlanPayload {
  name?: string
  mbps?: number
  price?: number
  description?: string
  active?: boolean
}

@Injectable({ providedIn: 'root' })
export class PlanService {
  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/plans`

  getAll(page = 1, limit = 20, search?: string, active?: boolean): Observable<PlanListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit)
    if (search) params = params.set('search', search)
    if (active !== undefined) params = params.set('active', String(active))
    return this.http.get<PlanListResponse>(this.apiUrl, { params })
  }

  getAllActive(): Observable<PlanListResponse> {
    const params = new HttpParams().set('page', 1).set('limit', 100).set('active', 'true')
    return this.http.get<PlanListResponse>(this.apiUrl, { params })
  }

  getById(id: string): Observable<PlanResponse> {
    return this.http.get<PlanResponse>(`${this.apiUrl}/${id}`)
  }

  create(payload: CreatePlanPayload): Observable<PlanResponse> {
    return this.http.post<PlanResponse>(this.apiUrl, payload)
  }

  update(id: string, payload: UpdatePlanPayload): Observable<PlanResponse> {
    return this.http.patch<PlanResponse>(`${this.apiUrl}/${id}`, payload)
  }

  remove(id: string): Observable<PlanResponse> {
    return this.http.delete<PlanResponse>(`${this.apiUrl}/${id}`)
  }
}
