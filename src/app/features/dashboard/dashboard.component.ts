import { Component, inject, signal, computed, OnInit } from '@angular/core'
import { AsyncPipe, NgClass } from '@angular/common'
import { Store } from '@ngrx/store'
import { TagModule } from 'primeng/tag'
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'

import { selectUser } from '../auth/store/auth.selectors'
import { DashboardService, DashboardData } from './dashboard.service'

interface LegendItem {
  label: string
  color: string
  value: number
  extra?: string
  pct: number
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AsyncPipe, NgClass, TagModule, ToastModule],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private store = inject(Store)
  private dashboardService = inject(DashboardService)
  private messageService = inject(MessageService)

  user$ = this.store.select(selectUser)
  loading = signal(true)
  data = signal<DashboardData | null>(null)

  // ── Bar chart ───────────────────────────────────────────────────
  barMax = computed(() => {
    const vals = this.data()?.revenueByMonth.map(m => m.total) ?? []
    return vals.length ? Math.max(...vals, 1) : 1
  })

  barPct(value: number): number {
    return Math.max(3, Math.round((value / this.barMax()) * 100))
  }

  // ── Donut charts ────────────────────────────────────────────────
  statusDonutGradient = computed(() =>
    this.buildGradient([
      { color: '#22c55e', value: this.data()?.paymentStatus.upToDate ?? 0 },
      { color: '#f59e0b', value: this.data()?.paymentStatus.grace    ?? 0 },
      { color: '#f97316', value: this.data()?.paymentStatus.late     ?? 0 },
      { color: '#ef4444', value: this.data()?.paymentStatus.overdue  ?? 0 },
    ])
  )

  methodDonutGradient = computed(() => {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4']
    return this.buildGradient(
      (this.data()?.paymentMethodBreakdown ?? []).map((m, i) => ({
        color: colors[i] ?? '#94a3b8',
        value: m.count,
      }))
    )
  })

  // ── Legends ─────────────────────────────────────────────────────
  statusLegend = computed((): LegendItem[] => {
    const s = this.data()?.paymentStatus
    if (!s) return []
    const total = s.upToDate + s.grace + s.late + s.overdue || 1
    return [
      { label: 'Al corriente', color: '#22c55e', value: s.upToDate, pct: Math.round(s.upToDate / total * 100) },
      { label: 'En gracia',    color: '#f59e0b', value: s.grace,    pct: Math.round(s.grace    / total * 100) },
      { label: 'Tardío',       color: '#f97316', value: s.late,     pct: Math.round(s.late     / total * 100) },
      { label: 'Con deuda',    color: '#ef4444', value: s.overdue,  pct: Math.round(s.overdue  / total * 100) },
    ]
  })

  methodLegend = computed((): LegendItem[] => {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4']
    const methods = this.data()?.paymentMethodBreakdown ?? []
    const total = methods.reduce((s, m) => s + m.count, 0) || 1
    return methods.map((m, i) => ({
      label:  m.label,
      color:  colors[i] ?? '#94a3b8',
      value:  m.count,
      extra:  this.fmtCurrency(m.total),
      pct:    Math.round(m.count / total * 100),
    }))
  })

  planTotal = computed(() =>
    this.data()?.planDistribution.reduce((s, p) => s + p.activeContracts, 0) || 1
  )

  statusTotal = computed(() => {
    const s = this.data()?.paymentStatus
    return s ? s.upToDate + s.grace + s.late + s.overdue : 0
  })

  // ── Lifecycle ───────────────────────────────────────────────────
  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.loading.set(true)
    this.dashboardService.getSummary().subscribe({
      next: res => {
        if (res.success) this.data.set(res.data)
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos del dashboard',
        })
        this.loading.set(false)
      },
    })
  }

  // ── Formatters ──────────────────────────────────────────────────
  fmtCurrency(n: number): string {
    return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short', timeZone: 'America/Mexico_City',
    })
  }

  paymentTypeLabel(type: string): string {
    const map: Record<string, string> = {
      FULL: 'Completo', PARTIAL_LATE: 'Parcial', PARTIAL_ADVANCE: 'Anticipado',
    }
    return map[type] ?? type
  }

  paymentTypeSeverity(type: string): 'success' | 'warn' | 'info' {
    if (type === 'FULL') return 'success'
    if (type === 'PARTIAL_ADVANCE') return 'info'
    return 'warn'
  }

  methodLabel(method: string): string {
    const map: Record<string, string> = { CASH: 'Efectivo', TRANSFER: 'Transferencia', CARD: 'Tarjeta' }
    return map[method] ?? method
  }

  // ── Private helpers ─────────────────────────────────────────────
  private buildGradient(items: { color: string; value: number }[]): string {
    const total = items.reduce((s, x) => s + x.value, 0) || 1
    let offset = 0
    const stops = items
      .filter(i => i.value > 0)
      .map(i => {
        const pct = (i.value / total) * 100
        const stop = `${i.color} ${offset.toFixed(1)}% ${(offset + pct).toFixed(1)}%`
        offset += pct
        return stop
      })
      .join(', ')
    return stops ? `conic-gradient(${stops})` : 'conic-gradient(#e2e8f0 0% 100%)'
  }
}
