import { Component, inject, OnInit, signal } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { InputTextModule } from 'primeng/inputtext'
import { InputNumberModule } from 'primeng/inputnumber'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { TextareaModule } from 'primeng/textarea'
import { MessageService } from 'primeng/api'

import { PlanService } from '../../services/plan.service'

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    ToastModule,
    TextareaModule,
  ],
  providers: [MessageService],
  templateUrl: './plan-form.component.html',
  styleUrl: './plan-form.component.scss',
})
export class PlanFormComponent implements OnInit {
  private fb = inject(FormBuilder)
  private planService = inject(PlanService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService)

  loading = signal(false)
  isEdit = signal(false)
  planId = signal<string | null>(null)

  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ]

  form = this.fb.group({
    name:        ['', [Validators.required]],
    mbps:        [null as number | null, [Validators.required, Validators.min(1)]],
    price:       [null as number | null, [Validators.required, Validators.min(0)]],
    description: [''],
    active:      [true],
  })

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.isEdit.set(true)
      this.planId.set(id)
      this.loadPlan(id)
    }
  }

  loadPlan(id: string): void {
    this.loading.set(true)
    this.planService.getById(id).subscribe({
      next: (res) => {
        if (res.success) {
          const { name, mbps, price, description, active } = res.data
          this.form.patchValue({ name, mbps, price, description, active })
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el plan' })
        this.loading.set(false)
      },
    })
  }

  onSubmit(): void {
    if (this.form.invalid) return
    this.loading.set(true)
    const value = this.form.value

    if (this.isEdit()) {
      const payload: any = {
        name: value.name,
        mbps: value.mbps,
        price: value.price,
        description: value.description || undefined,
        active: value.active,
      }
      this.planService.update(this.planId()!, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Plan actualizado' })
            setTimeout(() => this.router.navigate(['/admin/plans']), 1500)
          }
          this.loading.set(false)
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el plan' })
          this.loading.set(false)
        },
      })
    } else {
      const payload: any = {
        name: value.name,
        mbps: value.mbps,
        price: value.price,
        description: value.description || undefined,
      }
      this.planService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Plan creado' })
            setTimeout(() => this.router.navigate(['/admin/plans']), 1500)
          }
          this.loading.set(false)
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el plan (el nombre puede estar en uso)' })
          this.loading.set(false)
        },
      })
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/plans'])
  }
}
