import {
  Component, EventEmitter, Input, NgZone, OnChanges,
  OnDestroy, Output, SimpleChanges, inject, signal,
} from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { NgClass } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { DialogModule } from 'primeng/dialog'
import { ButtonModule } from 'primeng/button'
import { InputNumberModule } from 'primeng/inputnumber'
import { SelectModule } from 'primeng/select'
import { TextareaModule } from 'primeng/textarea'
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'

import { Customer, CustomerContract } from '../../services/customer.service'
import { PaymentService } from '../../../payments/services/payment.service'

// ─── Types ────────────────────────────────────────────────────────
export type PaymentStatus = 'first' | 'grace' | 'late' | 'overdue' | 'ahead'

interface PaymentInfo {
  status: PaymentStatus
  pendingMonths: number
  totalOwed: number
  periodFrom: Date
  isFirstPayment: boolean
  isLate: boolean
  isAhead: boolean
  hasOutstandingBalance: boolean
}

interface PaymentPreview {
  periodFrom: Date
  periodTo: Date
  paymentType: 'FULL' | 'PARTIAL_LATE' | 'PARTIAL_ADVANCE'
  balance: number | null
  autoNote: string
}

// ─── Date helpers ─────────────────────────────────────────────────
function endOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0)
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function toApiDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addMonthsEnd(base: Date, months: number): Date {
  const total = base.getMonth() + months - 1
  const year = base.getFullYear() + Math.floor(total / 12)
  const month = ((total % 12) + 12) % 12
  return endOfMonth(year, month)
}

// ─── Component ────────────────────────────────────────────────────
@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    NgClass,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.scss',
})
export class PaymentDialogComponent implements OnChanges, OnDestroy {
  private fb = inject(FormBuilder)
  private paymentService = inject(PaymentService)
  private messageService = inject(MessageService)
  private ngZone = inject(NgZone)
  private sub$ = new Subject<void>()

  @Input() customer: Customer | null = null
  @Input() visible = false
  @Output() visibleChange = new EventEmitter<boolean>()
  @Output() paymentSuccess = new EventEmitter<void>()

  loading = signal(false)
  paymentInfo: PaymentInfo | null = null
  preview: PaymentPreview | null = null

  form = this.fb.group({
    amount:        [null as number | null, [Validators.required, Validators.min(0.01)]],
    paymentMethod: ['CASH', Validators.required],
    notes:         [''],
  })

  paymentMethodOptions = [
    { label: 'Efectivo',       value: 'CASH'     },
    { label: 'Transferencia',  value: 'TRANSFER' },
    { label: 'Tarjeta',        value: 'CARD'     },
  ]

  // ── Derived state ──────────────────────────────────────────────
  get activeContract(): CustomerContract | null {
    return this.customer?.contracts?.find(c => c.status === 'ACTIVE') ?? null
  }

  get planPrice(): number {
    return this.activeContract?.plan.price ?? 0
  }

  get statusConfig(): { icon: string; label: string; subtitle: string } {
    const info = this.paymentInfo
    if (!info) return { icon: 'pi-info-circle', label: '', subtitle: '' }
    const fmt = (n: number) => `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
    switch (info.status) {
      case 'first':   return { icon: 'pi-star',                label: 'Primer pago',                        subtitle: 'El monto acordado quedará registrado como pago de regularización' }
      case 'grace':   return { icon: 'pi-clock',               label: 'Dentro del periodo de gracia',        subtitle: `Debe ${fmt(info.totalOwed)} — plazo hasta el día 5 del mes` }
      case 'late':    return { icon: 'pi-exclamation-triangle', label: 'Pago tardío',                        subtitle: `Debe ${fmt(info.totalOwed)} — venció el día 5 del mes` }
      case 'overdue': return { icon: 'pi-times-circle',         label: `Deuda acumulada (${info.pendingMonths} meses)`, subtitle: `Total adeudado: ${fmt(info.totalOwed)}` }
      case 'ahead':   return info.hasOutstandingBalance
        ? { icon: 'pi-info-circle', label: 'Anticipo parcial', subtitle: `Falta ${fmt(info.totalOwed)} para completar el siguiente período anticipado` }
        : { icon: 'pi-check-circle', label: 'Al corriente', subtitle: 'El cliente ya pagó el mes en curso — puede anticipar mensualidades futuras' }
    }
  }

  get paymentTypeLabel(): string {
    const map: Record<string, string> = { FULL: 'Completo', PARTIAL_LATE: 'Parcial / tardío', PARTIAL_ADVANCE: 'Abono anticipado' }
    return map[this.preview?.paymentType ?? ''] ?? ''
  }

  // ── Lifecycle ──────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    const visibleNow = changes['visible']?.currentValue === true
    const customerChanged = !!changes['customer']?.currentValue
    if ((visibleNow || customerChanged) && this.visible && this.customer) {
      this.initDialog()
    }
  }

  ngOnDestroy(): void {
    this.sub$.next()
    this.sub$.complete()
  }

  // ── Init ───────────────────────────────────────────────────────
  private initDialog(): void {
    this.paymentInfo = this.buildPaymentInfo()
    this.sub$.next() // cancel previous subscriptions

    const defaultAmount = this.paymentInfo?.isAhead
      ? (this.paymentInfo.hasOutstandingBalance ? this.paymentInfo.totalOwed : this.planPrice)
      : (this.paymentInfo?.totalOwed ?? this.planPrice)

    this.form.reset({ paymentMethod: 'CASH', notes: '', amount: defaultAmount })
    this.preview = defaultAmount ? this.buildPreview(defaultAmount) : null

    this.form.get('amount')?.valueChanges
      .pipe(takeUntil(this.sub$))
      .subscribe(val => {
        this.preview = val != null && val > 0 ? this.buildPreview(val) : null
      })
  }

  // ── Payment info (state from lastPaidPeriod) ──────────────────
  private buildPaymentInfo(): PaymentInfo | null {
    if (!this.activeContract) return null
    const today = new Date()
    const lp = this.customer?.lastPaidPeriod

    if (!lp) {
      return {
        status: 'first',
        pendingMonths: 0,
        totalOwed: this.planPrice,
        periodFrom: new Date(today.getFullYear(), today.getMonth(), 1),
        isFirstPayment: true,
        isLate: false,
        isAhead: false,
        hasOutstandingBalance: false,
      }
    }

    const lastPaid = new Date(lp)
    const nextM = (lastPaid.getMonth() + 1) % 12
    const nextY = lastPaid.getMonth() === 11 ? lastPaid.getFullYear() + 1 : lastPaid.getFullYear()
    const periodFrom = new Date(nextY, nextM, 1)

    const pending =
      (today.getFullYear() - periodFrom.getFullYear()) * 12 +
      (today.getMonth() - periodFrom.getMonth()) + 1

    if (pending <= 0) {
      const aheadPayments = this.activeContract?.payments ?? []
      const latestAhead = aheadPayments.length
        ? [...aheadPayments].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0]
        : null
      const advanceBalance = latestAhead?.paymentType === 'PARTIAL_ADVANCE' && latestAhead.balance != null
        ? Number(latestAhead.balance)
        : null
      const hasOutstandingBalance = advanceBalance != null && advanceBalance > 0
      return {
        status: 'ahead',
        pendingMonths: 0,
        totalOwed: hasOutstandingBalance ? advanceBalance! : 0,
        periodFrom: hasOutstandingBalance && latestAhead?.periodFrom
          ? new Date(latestAhead.periodFrom)
          : periodFrom,
        isFirstPayment: false,
        isLate: false,
        isAhead: true,
        hasOutstandingBalance,
      }
    }

    const day = today.getDate()
    const isLate = pending > 1 || day > 5

    let status: PaymentStatus
    if (pending === 1 && day <= 5) status = 'grace'
    else if (pending === 1)        status = 'late'
    else                           status = 'overdue'

    // Check if the latest payment was partial and left a balance
    const payments = this.activeContract?.payments ?? []
    const latestPayment = payments.length
      ? [...payments].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())[0]
      : null
    const pendingBalance = (
      latestPayment?.paymentType === 'PARTIAL_LATE' ||
      latestPayment?.paymentType === 'PARTIAL_ADVANCE'
    ) && latestPayment.balance != null
      ? Number(latestPayment.balance)
      : null
    const hasOutstandingBalance = pendingBalance != null && pendingBalance > 0

    return {
      status,
      pendingMonths: pending,
      totalOwed: hasOutstandingBalance ? pendingBalance! + pending * this.planPrice : pending * this.planPrice,
      periodFrom,
      isFirstPayment: false,
      isLate,
      isAhead: false,
      hasOutstandingBalance,
    }
  }

  // ── Preview (reactive to amount) ──────────────────────────────
  private buildPreview(amount: number): PaymentPreview | null {
    const info = this.paymentInfo
    if (!info) return null
    const price = this.planPrice
    const { periodFrom, isFirstPayment, isLate, isAhead, totalOwed } = info

    // First payment → always FULL for current month
    if (isFirstPayment) {
      return {
        periodFrom,
        periodTo: endOfMonth(periodFrom.getFullYear(), periodFrom.getMonth()),
        paymentType: 'FULL',
        balance: null,
        autoNote: 'Pago de regularización',
      }
    }

    // Already ahead → handle partial advance balance or register new advance
    if (isAhead) {
      // Completing or adding to an outstanding partial advance
      if (info.hasOutstandingBalance) {
        if (amount < totalOwed) {
          return {
            periodFrom,
            periodTo: endOfMonth(periodFrom.getFullYear(), periodFrom.getMonth()),
            paymentType: 'PARTIAL_ADVANCE',
            balance: Math.round((totalOwed - amount) * 100) / 100,
            autoNote: 'Abono a anticipo',
          }
        }
        let periodTo = endOfMonth(periodFrom.getFullYear(), periodFrom.getMonth())
        const extra = amount - totalOwed
        if (extra > 0.01) {
          const nm = (periodTo.getMonth() + 1) % 12
          const ny = periodTo.getMonth() === 11 ? periodTo.getFullYear() + 1 : periodTo.getFullYear()
          const extraMonths = Math.floor(extra / price)
          if (extraMonths > 0) {
            periodTo = addMonthsEnd(new Date(ny, nm, 1), extraMonths)
            const rem2 = extra % price
            if (rem2 > 0.01) {
              const nm2 = (periodTo.getMonth() + 1) % 12
              const ny2 = periodTo.getMonth() === 11 ? periodTo.getFullYear() + 1 : periodTo.getFullYear()
              periodTo = new Date(ny2, nm2, Math.max(1, Math.round(rem2 / price * daysInMonth(ny2, nm2))))
            }
          } else {
            periodTo = new Date(ny, nm, Math.max(1, Math.round(extra / price * daysInMonth(ny, nm))))
          }
        }
        return { periodFrom, periodTo, paymentType: 'FULL', balance: null, autoNote: 'Pago anticipado' }
      }

      // Fresh advance: partial month → PARTIAL_ADVANCE
      if (amount < price) {
        return {
          periodFrom,
          periodTo: endOfMonth(periodFrom.getFullYear(), periodFrom.getMonth()),
          paymentType: 'PARTIAL_ADVANCE',
          balance: Math.round((price - amount) * 100) / 100,
          autoNote: 'Abono anticipado',
        }
      }

      // Fresh advance: full month(s)
      const months = Math.floor(amount / price)
      const rem    = amount % price
      let periodTo = addMonthsEnd(periodFrom, months)
      if (rem > 0.01) {
        const nm = (periodTo.getMonth() + 1) % 12
        const ny = periodTo.getMonth() === 11 ? periodTo.getFullYear() + 1 : periodTo.getFullYear()
        periodTo = new Date(ny, nm, Math.max(1, Math.round(rem / price * daysInMonth(ny, nm))))
      }
      return { periodFrom, periodTo, paymentType: 'FULL', balance: null, autoNote: 'Pago anticipado' }
    }

    // Partial: amount < totalOwed
    if (amount < totalOwed) {
      const full = Math.floor(amount / price)
      const rem  = amount % price

      let periodTo: Date
      if (full === 0) {
        const days = daysInMonth(periodFrom.getFullYear(), periodFrom.getMonth())
        periodTo = new Date(periodFrom.getFullYear(), periodFrom.getMonth(), Math.max(1, Math.round(amount / price * days)))
      } else {
        periodTo = addMonthsEnd(periodFrom, full)
        if (rem > 0.01) {
          const nm = (periodTo.getMonth() + 1) % 12
          const ny = periodTo.getMonth() === 11 ? periodTo.getFullYear() + 1 : periodTo.getFullYear()
          periodTo = new Date(ny, nm, Math.max(1, Math.round(rem / price * daysInMonth(ny, nm))))
        }
      }

      return {
        periodFrom,
        periodTo,
        paymentType: 'PARTIAL_LATE',
        balance: Math.round((totalOwed - amount) * 100) / 100,
        autoNote: '',
      }
    }

    // Full payment or overpayment
    // When there's an outstanding balance from a prior partial payment, covering
    // totalOwed means covering all pendingMonths — not just amount/price months.
    let periodTo: Date
    let extra = 0

    if (info.hasOutstandingBalance) {
      periodTo = addMonthsEnd(periodFrom, info.pendingMonths)
      extra = amount - totalOwed
    } else {
      const full = Math.floor(amount / price)
      const rem  = amount % price
      periodTo = addMonthsEnd(periodFrom, full)
      extra = rem
    }

    if (extra > 0.01) {
      const nm = (periodTo.getMonth() + 1) % 12
      const ny = periodTo.getMonth() === 11 ? periodTo.getFullYear() + 1 : periodTo.getFullYear()
      const extraMonths = Math.floor(extra / price)
      if (extraMonths > 0) {
        const tmp = addMonthsEnd(new Date(ny, nm, 1), extraMonths)
        const rem2 = extra % price
        if (rem2 > 0.01) {
          const nm2 = (tmp.getMonth() + 1) % 12
          const ny2 = tmp.getMonth() === 11 ? tmp.getFullYear() + 1 : tmp.getFullYear()
          periodTo = new Date(ny2, nm2, Math.max(1, Math.round(rem2 / price * daysInMonth(ny2, nm2))))
        } else {
          periodTo = tmp
        }
      } else {
        periodTo = new Date(ny, nm, Math.max(1, Math.round(extra / price * daysInMonth(ny, nm))))
      }
    }

    return {
      periodFrom,
      periodTo,
      paymentType: 'FULL',
      balance: null,
      autoNote: isLate ? 'Pago completo con retraso' : '',
    }
  }

  // ── Formatting helpers ─────────────────────────────────────────
  fmtDate(date: Date): string {
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  }

  fmtCurrency(n: number): string {
    return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // ── Actions ────────────────────────────────────────────────────
  onClose(): void {
    this.visibleChange.emit(false)
  }

  onSubmit(): void {
    if (this.form.invalid || !this.activeContract || !this.preview) return
    this.loading.set(true)

    const { amount, paymentMethod, notes } = this.form.value
    const { periodFrom, periodTo, paymentType, balance, autoNote } = this.preview
    const userNote = notes?.trim() ?? ''
    const finalNotes = [autoNote, userNote].filter(Boolean).join('. ')

    const payload: any = {
      contractId:    this.activeContract.id,
      amount:        amount!,
      periodFrom:    toApiDate(periodFrom),
      periodTo:      toApiDate(periodTo),
      paymentType,
      paymentMethod: paymentMethod ?? 'CASH',
    }
    if (balance != null)  payload.balance = balance
    if (finalNotes)       payload.notes   = finalNotes

    this.paymentService.create(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Pago registrado',
            detail: `Folio: ${res.data.receipt?.folio ?? '—'}`,
          })
          this.ngZone.runOutsideAngular(() =>
            setTimeout(() => this.ngZone.run(() => {
              this.paymentSuccess.emit()
              this.onClose()
            }), 1500)
          )
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar el pago' })
        this.loading.set(false)
      },
    })
  }
}
