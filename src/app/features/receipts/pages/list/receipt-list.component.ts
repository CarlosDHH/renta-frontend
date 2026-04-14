import { Component, inject, OnInit, signal } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { TagModule } from 'primeng/tag'
import { SelectModule } from 'primeng/select'
import { DialogModule } from 'primeng/dialog'
import { InputTextModule } from 'primeng/inputtext'
import { InputMaskModule } from 'primeng/inputmask'
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'
import { FormsModule } from '@angular/forms'

import { ReceiptService, Receipt, SendStatus } from '../../services/receipt.service'

@Component({
  selector: 'app-receipt-list',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    InputMaskModule,
    ToastModule,
    FormsModule,
  ],
  providers: [MessageService],
  templateUrl: './receipt-list.component.html',
  styleUrl: './receipt-list.component.scss',
})
export class ReceiptListComponent implements OnInit {
  private receiptService = inject(ReceiptService)
  private messageService = inject(MessageService)
  private sanitizer = inject(DomSanitizer)

  receipts = signal<Receipt[]>([])
  loading = signal(false)
  totalRecords = signal(0)

  sendStatusFilter: SendStatus | '' = ''
  page = 1
  limit = 20

  // PDF viewer dialog
  pdfLoading = signal<string | null>(null)
  pdfBlobUrl = signal<SafeResourceUrl | null>(null)
  pdfDialogVisible = false
  pdfFolio = ''
  private currentBlobUrl: string | null = null

  // Mark-sent dialog
  markSentDialogVisible = false
  selectedReceipt: Receipt | null = null
  recipientPhone = ''
  markSentLoading = false

  sendStatusOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendientes', value: 'PENDING' },
    { label: 'Enviados', value: 'SENT' },
    { label: 'Fallidos', value: 'FAILED' },
  ]

  ngOnInit(): void {
    this.loadReceipts()
  }

  loadReceipts(): void {
    this.loading.set(true)
    const status = this.sendStatusFilter ? this.sendStatusFilter : undefined
    this.receiptService.getAll(this.page, this.limit, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.receipts.set(res.data.data)
          this.totalRecords.set(res.data.meta.total)
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los comprobantes' })
        this.loading.set(false)
      },
    })
  }

  onFilterChange(): void {
    this.page = 1
    this.loadReceipts()
  }

  onPageChange(event: any): void {
    this.page = event.page + 1
    this.limit = event.rows
    this.loadReceipts()
  }

  openPdf(receipt: Receipt): void {
    this.pdfLoading.set(receipt.id)
    this.receiptService.getPdfBlob(receipt.id).subscribe({
      next: (blob) => {
        const rawUrl = URL.createObjectURL(blob)
        this.currentBlobUrl = rawUrl
        this.pdfBlobUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl))
        this.pdfFolio = receipt.folio
        this.pdfDialogVisible = true
        this.pdfLoading.set(null)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el PDF' })
        this.pdfLoading.set(null)
      },
    })
  }

  closePdfDialog(): void {
    if (this.currentBlobUrl) URL.revokeObjectURL(this.currentBlobUrl)
    this.currentBlobUrl = null
    this.pdfBlobUrl.set(null)
    this.pdfDialogVisible = false
  }

  openMarkSentDialog(receipt: Receipt): void {
    this.selectedReceipt = receipt
    this.recipientPhone = receipt.recipientPhone ?? ''
    this.markSentDialogVisible = true
  }

  confirmMarkSent(): void {
    if (!this.selectedReceipt) return
    this.markSentLoading = true
    this.receiptService.markSent(this.selectedReceipt.id, this.recipientPhone || undefined).subscribe({
      next: (res) => {
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Comprobante marcado como enviado' })
          this.markSentDialogVisible = false
          this.selectedReceipt = null
          this.loadReceipts()
        }
        this.markSentLoading = false
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo marcar como enviado' })
        this.markSentLoading = false
      },
    })
  }

  getSendStatusSeverity(status: string): 'warn' | 'success' | 'danger' | 'secondary' {
    const map: Record<string, 'warn' | 'success' | 'danger' | 'secondary'> = {
      PENDING: 'warn',
      SENT: 'success',
      FAILED: 'danger',
    }
    return map[status] ?? 'secondary'
  }

  getSendStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      SENT: 'Enviado',
      FAILED: 'Fallido',
    }
    return labels[status] ?? status
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Mexico_City',
    })
  }

  formatAmount(amount?: number): string {
    if (amount == null) return '—'
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
  }
}
