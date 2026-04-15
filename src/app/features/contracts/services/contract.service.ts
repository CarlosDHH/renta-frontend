import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'

export type ContractStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'

export interface Contract {
  id: string
  customerId: string
  planId: string
  status: ContractStatus
  startDate: string
  endDate?: string
  customer: {
    id: string
    name: string
    lastName: string
    phone: string
  }
  plan: {
    id: string
    name: string
    mbps: number
    price: number
  }
}

export interface ContractListResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    data: Contract[]
    meta: { total: number; page: number; limit: number; pages: number }
  }
}

export interface ContractResponse {
  statusCode: number
  success: boolean
  message: string
  data: Contract
}

export interface CreateContractPayload {
  customerId: string
  planId: string
  startDate?: string
}

@Injectable({ providedIn: 'root' })
export class ContractService {
  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/contracts`

  getAll(
    page = 1,
    limit = 20,
    status?: ContractStatus,
    customerId?: string,
  ): Observable<ContractListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit)
    if (status) params = params.set('status', status)
    if (customerId) params = params.set('customerId', customerId)
    return this.http.get<ContractListResponse>(this.apiUrl, { params })
  }

  getAllActive(): Observable<ContractListResponse> {
    const params = new HttpParams().set('page', 1).set('limit', 200).set('status', 'ACTIVE')
    return this.http.get<ContractListResponse>(this.apiUrl, { params })
  }

  getById(id: string): Observable<ContractResponse> {
    return this.http.get<ContractResponse>(`${this.apiUrl}/${id}`)
  }

  create(payload: CreateContractPayload): Observable<ContractResponse> {
    return this.http.post<ContractResponse>(this.apiUrl, payload)
  }

  updateStatus(id: string, status: ContractStatus): Observable<ContractResponse> {
    return this.http.patch<ContractResponse>(`${this.apiUrl}/${id}/status`, { status })
  }

  remove(id: string): Observable<ContractResponse> {
    return this.http.delete<ContractResponse>(`${this.apiUrl}/${id}`)
  }
}
