import { Component, inject, OnInit, signal } from '@angular/core'
import { Router } from '@angular/router'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { TagModule } from 'primeng/tag'
import { InputTextModule } from 'primeng/inputtext'
import { SelectModule } from 'primeng/select'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { ConfirmationService, MessageService } from 'primeng/api'
import { FormsModule } from '@angular/forms'
import { TooltipModule } from 'primeng/tooltip'

import { CustomerService, Customer } from '../../services/customer.service'
import { PaymentDialogComponent } from '../../components/payment-dialog/payment-dialog.component'

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    FormsModule,
    TooltipModule,
    PaymentDialogComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService)
  private router = inject(Router)
  private confirmationService = inject(ConfirmationService)
  private messageService = inject(MessageService)

  customers = signal<Customer[]>([])
  loading = signal(false)
  totalRecords = signal(0)
  searchTerm = signal('')

  selectedCustomer = signal<Customer | null>(null)
  paymentDialogVisible = signal(false)

  activeFilter: boolean | undefined = undefined
  page = 1
  limit = 20

  activeOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false },
  ]

  ngOnInit(): void {
    this.loadCustomers()
  }

  loadCustomers(): void {
    this.loading.set(true)
    this.customerService.getAll(this.page, this.limit, this.searchTerm(), this.activeFilter).subscribe({
      next: (res) => {
        if (res.success) {
          this.customers.set(res.data.data)
          this.totalRecords.set(res.data.meta.total)
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los clientes' })
        this.loading.set(false)
      },
    })
  }

  onSearch(): void {
    this.page = 1
    this.loadCustomers()
  }

  onFilterChange(): void {
    this.page = 1
    this.loadCustomers()
  }

  onPageChange(event: any): void {
    this.page = event.page + 1
    this.limit = event.rows
    this.loadCustomers()
  }

  openPaymentDialog(customer: Customer): void {
    this.selectedCustomer.set(customer)
    this.paymentDialogVisible.set(true)
  }

  onPaymentSuccess(): void {
    this.paymentDialogVisible.set(false)
    this.loadCustomers()
  }

  goToCreate(): void {
    this.router.navigate(['/admin/customers/new'])
  }

  goToEdit(id: string): void {
    this.router.navigate([`/admin/customers/${id}/edit`])
  }

  confirmDelete(customer: Customer): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar a ${customer.name} ${customer.lastName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteCustomer(customer.id),
    })
  }

  deleteCustomer(id: string): void {
    this.customerService.remove(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente eliminado' })
          this.loadCustomers()
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el cliente' })
      },
    })
  }

  hasActiveContract(customer: Customer): boolean {
    return !!customer.contracts?.some((c) => c.status === 'ACTIVE')
  }

  getStatusSeverity(active: boolean): 'success' | 'danger' {
    return active ? 'success' : 'danger'
  }

  getContractStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      ACTIVE: 'success',
      SUSPENDED: 'warn',
      CANCELLED: 'danger',
    }
    return map[status] ?? 'secondary'
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Mexico_City' })
  }
}
