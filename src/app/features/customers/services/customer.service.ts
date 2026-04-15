import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'

export interface Customer {
  id: string
  name: string
  lastName: string
  email?: string
  phone: string
  municipality?: string
  city?: string
  lastPaidPeriod?: string
  active: boolean
  contracts?: CustomerContract[]
}

export interface CustomerContract {
  id: string
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
  plan: {
    id: string
    name: string
    mbps: number
    price: number
  }
}

export interface CustomerListResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    data: Customer[]
    meta: { total: number; page: number; limit: number; pages: number }
  }
}

export interface CustomerResponse {
  statusCode: number
  success: boolean
  message: string
  data: Customer
}

export interface CreateCustomerPayload {
  name: string
  lastName: string
  phone: string
  email?: string
  municipality?: string
  city?: string
}

export interface UpdateCustomerPayload {
  name?: string
  lastName?: string
  email?: string
  phone?: string
  municipality?: string
  city?: string
  active?: boolean
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/customers`

  getAll(page = 1, limit = 20, search?: string, active?: boolean): Observable<CustomerListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit)
    if (search) params = params.set('search', search)
    if (active !== undefined) params = params.set('active', String(active))
    return this.http.get<CustomerListResponse>(this.apiUrl, { params })
  }

  getById(id: string): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.apiUrl}/${id}`)
  }

  create(payload: CreateCustomerPayload): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(this.apiUrl, payload)
  }

  update(id: string, payload: UpdateCustomerPayload): Observable<CustomerResponse> {
    return this.http.patch<CustomerResponse>(`${this.apiUrl}/${id}`, payload)
  }

  remove(id: string): Observable<CustomerResponse> {
    return this.http.delete<CustomerResponse>(`${this.apiUrl}/${id}`)
  }
}
