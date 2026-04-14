import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'

export type SendStatus = 'PENDING' | 'SENT' | 'FAILED'

export interface Receipt {
  id: string
  folio: string
  sendStatus: SendStatus
  sentAt?: string
  recipientPhone?: string
  createdAt: string
  payment?: {
    id: string
    amount: number
    periodFrom: string
    periodTo: string
    paymentType: string
    paidAt: string
    contract?: {
      customer: { id: string; name: string; lastName: string }
      plan: { id: string; name: string; price: number }
    }
  }
}

export interface ReceiptListResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    data: Receipt[]
    meta: { total: number; page: number; limit: number; pages: number }
  }
}

export interface ReceiptResponse {
  statusCode: number
  success: boolean
  message: string
  data: Receipt
}

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/receipts`

  getAll(page = 1, limit = 20, sendStatus?: SendStatus): Observable<ReceiptListResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit)
    if (sendStatus) params = params.set('sendStatus', sendStatus)
    return this.http.get<ReceiptListResponse>(this.apiUrl, { params })
  }

  getById(id: string): Observable<ReceiptResponse> {
    return this.http.get<ReceiptResponse>(`${this.apiUrl}/${id}`)
  }

  getPdfBlob(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' })
  }

  markSent(id: string, recipientPhone?: string): Observable<ReceiptResponse> {
    return this.http.patch<ReceiptResponse>(`${this.apiUrl}/${id}/mark-sent`, { recipientPhone })
  }
}
