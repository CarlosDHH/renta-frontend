import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'

export interface DashboardKpis {
  activeCustomers: number
  activeContracts: number
  newCustomersThisMonth: number
  revenueThisMonth: number
  revenueLastMonth: number
  revenueVariationPercent: number
  totalPaymentsThisMonth: number
  pendingReceiptsCount: number
}

export interface PaymentStatusBreakdown {
  upToDate: number
  grace: number
  late: number
  overdue: number
}

export interface RevenueMonth {
  month: string
  label: string
  total: number
  paymentsCount: number
}

export interface PlanDistribution {
  planId: string
  planName: string
  price: number
  activeContracts: number
}

export interface PaymentMethodBreakdown {
  method: string
  label: string
  count: number
  total: number
}

export interface RecentPayment {
  id: string
  folio: string
  customerName: string
  planName: string
  amount: number
  paymentType: string
  paymentMethod: string
  paidAt: string
}

export interface OverdueCustomer {
  customerId: string
  customerName: string
  phone: string
  planName: string
  planPrice: number
  lastPaidPeriod: string | null
  monthsOverdue: number
  estimatedDebt: number
}

export interface DashboardData {
  kpis: DashboardKpis
  paymentStatus: PaymentStatusBreakdown
  revenueByMonth: RevenueMonth[]
  planDistribution: PlanDistribution[]
  paymentMethodBreakdown: PaymentMethodBreakdown[]
  recentPayments: RecentPayment[]
  overdueCustomers: OverdueCustomer[]
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient)
  private readonly url = `${environment.apiUrl}/dashboard/summary`

  getSummary(months = 6): Observable<{ success: boolean; data: DashboardData }> {
    return this.http.get<{ success: boolean; data: DashboardData }>(this.url, {
      params: { months: String(months) },
    })
  }
}
