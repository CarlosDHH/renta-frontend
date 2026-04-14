import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'

export type PaymentType = 'FULL' | 'PARTIAL_ADVANCE' | 'PARTIAL_LATE'
export type PaymentMethod = 'CASH' | 'TRANSFER' | 'CARD'

export interface Payment {
  id: string
  contractId: string
  amount: number
  paymentType: PaymentType
  paymentMethod: PaymentMethod
  balance?: number
  periodFrom: string
  periodTo: string
  paidAt: string
  notes?: string
  contract?: {
    id: string
    customer: { id: string; name: string; lastName: string }
    plan: { id: string; name: string; price: number }
  }
  user?: { id: string; name: string; lastName: string }
  receipt?: { id: string; folio: string; sendStatus: string }
}

export interface PaymentListResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    data: Payment[]
    meta: { total: number; page: number; limit: number; pages: number }
  }
}

export interface PaymentResponse {
  statusCode: number
  success: boolean
  message: string
  data: Payment
}

export interface CreatePaymentPayload {
  contractId: string
  amount: number
  periodFrom: string
  periodTo: string
  paymentType?: PaymentType
  paymentMethod?: PaymentMethod
  balance?: number
  notes?: string
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/payments`

  getAll(page = 1, limit = 20, paymentType?: PaymentType): Observable<PaymentListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit)
    if (paymentType) params = params.set('paymentType', paymentType)
    return this.http.get<PaymentListResponse>(this.apiUrl, { params })
  }

  getById(id: string): Observable<PaymentResponse> {
    return this.http.get<PaymentResponse>(`${this.apiUrl}/${id}`)
  }

  create(payload: CreatePaymentPayload): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, payload)
  }

  remove(id: string): Observable<PaymentResponse> {
    return this.http.delete<PaymentResponse>(`${this.apiUrl}/${id}`)
  }
}
