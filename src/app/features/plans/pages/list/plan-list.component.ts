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

import { PlanService, Plan } from '../../services/plan.service'

@Component({
  selector: 'app-plan-list',
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
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './plan-list.component.html',
  styleUrl: './plan-list.component.scss',
})
export class PlanListComponent implements OnInit {
  private planService = inject(PlanService)
  private router = inject(Router)
  private confirmationService = inject(ConfirmationService)
  private messageService = inject(MessageService)

  plans = signal<Plan[]>([])
  loading = signal(false)
  totalRecords = signal(0)
  searchTerm = signal('')

  activeFilter: boolean | undefined = undefined
  page = 1
  limit = 20

  activeOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false },
  ]

  ngOnInit(): void {
    this.loadPlans()
  }

  loadPlans(): void {
    this.loading.set(true)
    this.planService.getAll(this.page, this.limit, this.searchTerm(), this.activeFilter).subscribe({
      next: (res) => {
        if (res.success) {
          this.plans.set(res.data.data)
          this.totalRecords.set(res.data.meta.total)
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los planes' })
        this.loading.set(false)
      },
    })
  }

  onSearch(): void {
    this.page = 1
    this.loadPlans()
  }

  onFilterChange(): void {
    this.page = 1
    this.loadPlans()
  }

  onPageChange(event: any): void {
    this.page = event.page + 1
    this.limit = event.rows
    this.loadPlans()
  }

  goToCreate(): void {
    this.router.navigate(['/admin/plans/new'])
  }

  goToEdit(id: string): void {
    this.router.navigate([`/admin/plans/${id}/edit`])
  }

  confirmDelete(plan: Plan): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el plan "${plan.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deletePlan(plan.id),
    })
  }

  deletePlan(id: string): void {
    this.planService.remove(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Plan eliminado' })
          this.loadPlans()
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el plan (puede tener contratos activos)' })
      },
    })
  }

  getStatusSeverity(active: boolean): 'success' | 'danger' {
    return active ? 'success' : 'danger'
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price)
  }
}
