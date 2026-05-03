import { Component, inject, OnInit, signal } from '@angular/core'
import { Router } from '@angular/router'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { DialogModule } from 'primeng/dialog'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { ConfirmationService, MessageService } from 'primeng/api'
import { FormsModule } from '@angular/forms'

import { ContractService, Contract, ContractStatus } from '../../services/contract.service'

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    FormsModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './contract-list.component.html',
  styleUrl: './contract-list.component.scss',
})
export class ContractListComponent implements OnInit {
  private contractService = inject(ContractService)
  private router = inject(Router)
  private confirmationService = inject(ConfirmationService)
  private messageService = inject(MessageService)

  contracts = signal<Contract[]>([])
  loading = signal(false)
  totalRecords = signal(0)

  statusFilter: ContractStatus | '' = ''
  page = 1
  limit = 20

  // Status change dialog
  statusDialogVisible = false
  selectedContract: Contract | null = null
  newStatus: ContractStatus = 'ACTIVE'
  statusLoading = false

  statusFilterOptions = [
    { label: 'Todos', value: '' },
    { label: 'Activos', value: 'ACTIVE' },
    { label: 'Suspendidos', value: 'SUSPENDED' },
    { label: 'Cancelados', value: 'CANCELLED' },
  ]

  statusChangeOptions = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Suspendido', value: 'SUSPENDED' },
    { label: 'Cancelado', value: 'CANCELLED' },
  ]

  ngOnInit(): void {
    this.loadContracts()
  }

  loadContracts(): void {
    this.loading.set(true)
    const status = this.statusFilter ? this.statusFilter : undefined
    this.contractService.getAll(this.page, this.limit, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.contracts.set(res.data.data)
          this.totalRecords.set(res.data.meta.total)
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los contratos' })
        this.loading.set(false)
      },
    })
  }

  onFilterChange(): void {
    this.page = 1
    this.loadContracts()
  }

  onPageChange(event: any): void {
    this.page = Math.floor(event.first / event.rows) + 1
    this.limit = event.rows
    this.loadContracts()
  }

  goToCreate(): void {
    this.router.navigate(['/admin/contracts/new'])
  }

  openStatusDialog(contract: Contract): void {
    this.selectedContract = contract
    this.newStatus = contract.status
    this.statusDialogVisible = true
  }

  confirmStatusChange(): void {
    if (!this.selectedContract) return
    this.statusLoading = true
    this.contractService.updateStatus(this.selectedContract.id, this.newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado actualizado' })
          this.statusDialogVisible = false
          this.selectedContract = null
          this.loadContracts()
        }
        this.statusLoading = false
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado' })
        this.statusLoading = false
      },
    })
  }

  confirmDelete(contract: Contract): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el contrato de ${contract.customer.name} ${contract.customer.lastName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteContract(contract.id),
    })
  }

  deleteContract(id: string): void {
    this.contractService.remove(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contrato eliminado' })
          this.loadContracts()
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar (solo contratos no activos)' })
      },
    })
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      ACTIVE: 'success',
      SUSPENDED: 'warn',
      CANCELLED: 'danger',
    }
    return map[status] ?? 'secondary'
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Activo',
      SUSPENDED: 'Suspendido',
      CANCELLED: 'Cancelado',
    }
    return labels[status] ?? status
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Mexico_City' })
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
  }
}
