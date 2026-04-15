import { Component, inject, OnInit, signal } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { InputTextModule } from 'primeng/inputtext'
import { MessageService } from 'primeng/api'

import { ContractService } from '../../services/contract.service'
import { CustomerService, Customer } from '../../../customers/services/customer.service'
import { PlanService, Plan } from '../../../plans/services/plan.service'

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
  ],
  providers: [MessageService],
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.scss',
})
export class ContractFormComponent implements OnInit {
  private fb = inject(FormBuilder)
  private contractService = inject(ContractService)
  private customerService = inject(CustomerService)
  private planService = inject(PlanService)
  private router = inject(Router)
  private messageService = inject(MessageService)

  loading = signal(false)
  loadingOptions = signal(true)

  customers = signal<{ label: string; value: string }[]>([])
  plans = signal<{ label: string; value: string }[]>([])

  form = this.fb.group({
    customerId: ['', [Validators.required]],
    planId:     ['', [Validators.required]],
    startDate:  [''],
  })

  ngOnInit(): void {
    this.loadOptions()
  }

  loadOptions(): void {
    this.loadingOptions.set(true)
    let customersLoaded = false
    let plansLoaded = false

    const checkDone = () => {
      if (customersLoaded && plansLoaded) this.loadingOptions.set(false)
    }

    this.customerService.getAll(1, 200).subscribe({
      next: (res) => {
        if (res.success) {
          this.customers.set(
            res.data.data
              .filter((c) => c.active)
              .map((c) => ({ label: `${c.name} ${c.lastName} — ${c.phone}`, value: c.id })),
          )
        }
        customersLoaded = true
        checkDone()
      },
      error: () => {
        customersLoaded = true
        checkDone()
      },
    })

    this.planService.getAllActive().subscribe({
      next: (res) => {
        if (res.success) {
          this.plans.set(
            res.data.data.map((p) => ({
              label: `${p.name} — ${p.mbps} Mbps — $${p.price}`,
              value: p.id,
            })),
          )
        }
        plansLoaded = true
        checkDone()
      },
      error: () => {
        plansLoaded = true
        checkDone()
      },
    })
  }

  onSubmit(): void {
    if (this.form.invalid) return
    this.loading.set(true)
    const value = this.form.value

    const payload: any = {
      customerId: value.customerId,
      planId: value.planId,
    }
    if (value.startDate) payload.startDate = value.startDate

    this.contractService.create(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contrato creado' })
          setTimeout(() => this.router.navigate(['/admin/contracts']), 1500)
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el contrato (el cliente puede ya tener un contrato activo)' })
        this.loading.set(false)
      },
    })
  }

  goBack(): void {
    this.router.navigate(['/admin/contracts'])
  }
}
