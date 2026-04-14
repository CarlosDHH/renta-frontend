import { Component, inject, OnInit, signal } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { InputTextModule } from 'primeng/inputtext'
import { InputNumberModule } from 'primeng/inputnumber'
import { TextareaModule } from 'primeng/textarea'
import { MessageService } from 'primeng/api'

import { PaymentService } from '../../services/payment.service'
import { ContractService, Contract } from '../../../contracts/services/contract.service'

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
  ],
  providers: [MessageService],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.scss',
})
export class PaymentFormComponent implements OnInit {
  private fb = inject(FormBuilder)
  private paymentService = inject(PaymentService)
  private contractService = inject(ContractService)
  private router = inject(Router)
  private messageService = inject(MessageService)

  loading = signal(false)
  loadingContracts = signal(true)

  contractOptions = signal<{ label: string; value: string; price: number }[]>([])

  paymentTypeOptions = [
    { label: 'Completo', value: 'FULL' },
    { label: 'Anticipo parcial', value: 'PARTIAL_ADVANCE' },
    { label: 'Pago tardío', value: 'PARTIAL_LATE' },
  ]

  paymentMethodOptions = [
    { label: 'Efectivo', value: 'CASH' },
    { label: 'Transferencia', value: 'TRANSFER' },
    { label: 'Tarjeta', value: 'CARD' },
  ]

  form = this.fb.group({
    contractId:    ['', [Validators.required]],
    amount:        [null as number | null, [Validators.required, Validators.min(0.01)]],
    periodFrom:    ['', [Validators.required]],
    periodTo:      ['', [Validators.required]],
    paymentType:   ['FULL'],
    paymentMethod: ['CASH'],
    balance:       [null as number | null],
    notes:         [''],
  })

  ngOnInit(): void {
    this.loadContracts()

    // Auto-fill amount when contract is selected
    this.form.get('contractId')?.valueChanges.subscribe((id) => {
      const selected = this.contractOptions().find((c) => c.value === id)
      if (selected) {
        this.form.patchValue({ amount: selected.price }, { emitEvent: false })
      }
    })
  }

  loadContracts(): void {
    this.loadingContracts.set(true)
    this.contractService.getAllActive().subscribe({
      next: (res) => {
        if (res.success) {
          this.contractOptions.set(
            res.data.data.map((c: Contract) => ({
              label: `${c.customer.name} ${c.customer.lastName} — ${c.plan.name} ($${c.plan.price})`,
              value: c.id,
              price: c.plan.price,
            })),
          )
        }
        this.loadingContracts.set(false)
      },
      error: () => {
        this.loadingContracts.set(false)
      },
    })
  }

  onSubmit(): void {
    if (this.form.invalid) return
    this.loading.set(true)
    const value = this.form.value

    const payload: any = {
      contractId: value.contractId,
      amount: value.amount,
      periodFrom: value.periodFrom,
      periodTo: value.periodTo,
      paymentType: value.paymentType || undefined,
      paymentMethod: value.paymentMethod || undefined,
    }
    if (value.balance != null) payload.balance = value.balance
    if (value.notes) payload.notes = value.notes

    this.paymentService.create(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pago registrado correctamente' })
          setTimeout(() => this.router.navigate(['/admin/payments']), 1500)
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el pago' })
        this.loading.set(false)
      },
    })
  }

  goBack(): void {
    this.router.navigate(['/admin/payments'])
  }
}
