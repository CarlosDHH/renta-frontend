import { Injectable, inject } from '@angular/core'
import jsPDF from 'jspdf'
import { firstValueFrom } from 'rxjs'

import { NetworkService } from './network.service'
import { ReceiptService, Receipt } from '../../features/receipts/services/receipt.service'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

const C = {
  PRIMARY: '#1e293b',
  ACCENT:  '#3b82f6',
  GRAY:    '#64748b',
  LIGHT:   '#f1f5f9',
  SUCCESS: '#16a34a',
  RED:     '#dc2626',
  WHITE:   '#ffffff',
  MUTED:   '#94a3b8',
}

// ─── Service ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class PdfService {
  private network        = inject(NetworkService)
  private receiptService = inject(ReceiptService)

  async downloadReceipt(receipt: Receipt): Promise<void> {
    if (this.network.isOnline()) {
      const blob = await firstValueFrom(this.receiptService.getPdfBlob(receipt.id))
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `comprobante-${receipt.folio}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      this.generateOfflinePdf(receipt)
    }
  }

  private generateOfflinePdf(receipt: Receipt): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const p        = receipt.payment
    const customer = p?.contract?.customer
    const plan     = p?.contract?.plan

    const textColor  = (hex: string) => { const [r, g, b] = hexRgb(hex); doc.setTextColor(r, g, b) }
    const fillColor  = (hex: string) => { const [r, g, b] = hexRgb(hex); doc.setFillColor(r, g, b) }

    // ── 1. HEADER ────────────────────────────────────────────────
    fillColor(C.PRIMARY)
    doc.rect(0, 0, 595, 120, 'F')

    textColor(C.WHITE)
    doc.setFontSize(24).setFont('helvetica', 'bold')
    doc.text('Renta Internet', 50, 35)

    textColor(C.MUTED)
    doc.setFontSize(10).setFont('helvetica', 'normal')
    doc.text('Comprobante de pago', 50, 65)

    doc.text('Folio', 430, 35)

    textColor(C.WHITE)
    doc.setFontSize(14).setFont('helvetica', 'bold')
    doc.text(receipt.folio, 430, 52)

    const fechaLarga = new Date(receipt.createdAt).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    textColor(C.MUTED)
    doc.setFontSize(9).setFont('helvetica', 'normal')
    doc.text(`Fecha: ${fechaLarga}`, 430, 75)

    // ── 2. DATOS DEL CLIENTE ─────────────────────────────────────
    const sectionTitle = (label: string, y: number) => {
      textColor(C.GRAY)
      doc.setFontSize(11).setFont('helvetica', 'bold')
      doc.text(label, 50, y)
      fillColor(C.LIGHT)
      doc.rect(50, y + 10, 512, 1, 'F')
    }

    const dataRow = (label: string, value: string, y: number) => {
      textColor(C.PRIMARY)
      doc.setFontSize(10).setFont('helvetica', 'bold')
      doc.text(label, 50, y)
      textColor(C.GRAY)
      doc.setFont('helvetica', 'normal')
      doc.text(value || '—', 160, y)
    }

    sectionTitle('DATOS DEL CLIENTE', 145)

    const nombre    = customer ? `${customer.name} ${customer.lastName}` : '—'
    const municipio = customer
      ? [`${customer.municipality ?? ''}`, `${customer.city ?? ''}`].filter(Boolean).join(', ') || '—'
      : '—'

    dataRow('Nombre:',    nombre,                  170)
    dataRow('Municipio:', municipio,                188)
    dataRow('Teléfono:',  customer?.phone ?? '—',  206)

    // ── 3. DETALLE DEL SERVICIO ──────────────────────────────────
    sectionTitle('DETALLE DEL SERVICIO', 245)

    const fmtMonthYear = (iso: string) =>
      new Date(iso).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

    const methodMap: Record<string, string> = {
      CASH: 'Efectivo', TRANSFER: 'Transferencia', CARD: 'Tarjeta',
    }
    const typeMap: Record<string, string> = {
      FULL:             'Pago completo',
      PARTIAL_ADVANCE:  'Pago parcial adelantado',
      PARTIAL_LATE:     'Pago parcial atrasado',
    }

    const periodo = p ? `${fmtMonthYear(p.periodFrom)} — ${fmtMonthYear(p.periodTo)}` : '—'
    const metodo  = p?.paymentMethod ? (methodMap[p.paymentMethod] ?? p.paymentMethod) : '—'
    const tipo    = p?.paymentType   ? (typeMap[p.paymentType]    ?? p.paymentType)    : '—'

    dataRow('Plan:',           plan?.name ?? '—',           270)
    dataRow('Velocidad:',      plan?.mbps ? `${plan.mbps} Mbps` : '—', 288)
    dataRow('Período:',        periodo,                     306)
    dataRow('Método de pago:', metodo,                      324)
    dataRow('Tipo de pago:',   tipo,                        342)

    if (p?.notes) {
      dataRow('Notas:', p.notes, 360)
    }

    // ── 4. CAJA DE MONTO ─────────────────────────────────────────
    fillColor(C.LIGHT)
    doc.rect(50, 400, 512, 80, 'F')

    textColor(C.GRAY)
    doc.setFontSize(12).setFont('helvetica', 'bold')
    doc.text('TOTAL PAGADO', 70, 418)

    textColor(C.SUCCESS)
    doc.setFontSize(28).setFont('helvetica', 'bold')
    doc.text(`$${(p?.amount ?? 0).toFixed(2)} MXN`, 70, 438)

    if (p?.balance && p.balance > 0) {
      textColor(C.RED)
      doc.setFontSize(10).setFont('helvetica', 'normal')
      doc.text(`Saldo pendiente: $${p.balance.toFixed(2)} MXN`, 350, 445)
    }

    // ── 5. REGISTRADO POR ────────────────────────────────────────
    if (p?.user) {
      textColor(C.GRAY)
      doc.setFontSize(9).setFont('helvetica', 'normal')
      doc.text(`Registrado por: ${p.user.name} ${p.user.lastName}`, 50, 505)
    }

    // ── 6. FOOTER ────────────────────────────────────────────────
    fillColor(C.LIGHT)
    doc.rect(0, 720, 612, 122, 'F')

    textColor(C.GRAY)
    doc.setFontSize(9).setFont('helvetica', 'normal')
    doc.text('Este comprobante es un documento válido de pago.', 306, 735, { align: 'center' })

    textColor(C.MUTED)
    doc.setFontSize(8)
    doc.text(`Folio de verificación: ${receipt.folio}`, 306, 752, { align: 'center' })

    textColor(C.ACCENT)
    doc.text('Renta Internet — Sistema de gestión', 306, 768, { align: 'center' })

    doc.save(`comprobante-${receipt.folio}.pdf`)
  }
}
