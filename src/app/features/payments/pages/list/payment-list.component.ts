import { Component, inject, OnInit, signal } from '@angular/core'
import { Router } from '@angular/router'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { ConfirmationService, MessageService } from 'primeng/api'
import { FormsModule } from '@angular/forms'

import { PaymentService, Payment, PaymentType } from '../../services/payment.service'

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    FormsModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
})
export class PaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService)
  private router = inject(Router)
  private confirmationService = inject(ConfirmationService)
  private messageService = inject(MessageService)

  payments = signal<Payment[]>([])
  loading = signal(false)
  totalRecords = signal(0)

  paymentTypeFilter: PaymentType | '' = ''
  page = 1
  limit = 20

  paymentTypeOptions = [
    { label: 'Todos', value: '' },
    { label: 'Completo', value: 'FULL' },
    { label: 'Anticipo parcial', value: 'PARTIAL_ADVANCE' },
    { label: 'Pago tardío', value: 'PARTIAL_LATE' },
  ]

  ngOnInit(): void {
    this.loadPayments()
  }

  loadPayments(): void {
    this.loading.set(true)
    const type = this.paymentTypeFilter ? this.paymentTypeFilter : undefined
    this.paymentService.getAll(this.page, this.limit, type).subscribe({
      next: (res) => {
        if (res.success) {
          this.payments.set(res.data.data)
          this.totalRecords.set(res.data.meta.total)
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los pagos' })
        this.loading.set(false)
      },
    })
  }

  onFilterChange(): void {
    this.page = 1
    this.loadPayments()
  }

  onPageChange(event: any): void {
    this.page = Math.floor(event.first / event.rows) + 1
    this.limit = event.rows
    this.loadPayments()
  }

  goToCreate(): void {
    this.router.navigate(['/admin/payments/new'])
  }

  confirmDelete(payment: Payment): void {
    const customer = payment.contract?.customer
    const label = customer ? `${customer.name} ${customer.lastName}` : payment.id
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el pago de ${label}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deletePayment(payment.id),
    })
  }

  deletePayment(id: string): void {
    this.paymentService.remove(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pago eliminado' })
          this.loadPayments()
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el pago' })
      },
    })
  }

  getPaymentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      FULL: 'Completo',
      PARTIAL_ADVANCE: 'Anticipo',
      PARTIAL_LATE: 'Tardío',
    }
    return labels[type] ?? type
  }

  getPaymentTypeSeverity(type: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      FULL: 'success',
      PARTIAL_ADVANCE: 'warn',
      PARTIAL_LATE: 'danger',
    }
    return map[type] ?? 'secondary'
  }

  getMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      CASH: 'Efectivo',
      TRANSFER: 'Transferencia',
      CARD: 'Tarjeta',
    }
    return labels[method] ?? method
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Mexico_City',
    })
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
  }

  formatPeriod(from?: string, to?: string): string {
    if (!from || !to) return '—'
    const f = new Date(from).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', timeZone: 'America/Mexico_City' })
    const t = new Date(to).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Mexico_City' })
    return `${f} – ${t}`
  }
}
