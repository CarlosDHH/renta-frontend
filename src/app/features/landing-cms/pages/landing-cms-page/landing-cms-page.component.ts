import { Component, inject, signal, OnInit } from '@angular/core'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'
import { FormsModule } from '@angular/forms'
import { TableModule } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { TagModule } from 'primeng/tag'
import { InputTextModule } from 'primeng/inputtext'
import { InputNumberModule } from 'primeng/inputnumber'
import { TextareaModule } from 'primeng/textarea'
import { CheckboxModule } from 'primeng/checkbox'
import { SelectModule } from 'primeng/select'
import { DialogModule } from 'primeng/dialog'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ToastModule } from 'primeng/toast'
import { TabsModule } from 'primeng/tabs'
import { DividerModule } from 'primeng/divider'
import { ConfirmationService, MessageService } from 'primeng/api'

import {
  LandingCmsService,
  CmsService,
  CmsProduct,
  CmsNewsArticle,
  ContactInquiry,
} from '../../services/landing-cms.service'

@Component({
  selector: 'app-landing-cms-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    CheckboxModule,
    SelectModule,
    DialogModule,
    ConfirmDialogModule,
    ToastModule,
    TabsModule,
    DividerModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './landing-cms-page.component.html',
  styleUrl: './landing-cms-page.component.scss',
})
export class LandingCmsPageComponent implements OnInit {
  private fb = inject(FormBuilder)
  private cmsService = inject(LandingCmsService)
  private messageService = inject(MessageService)
  private confirmService = inject(ConfirmationService)

  // Saving states
  savingConfig = signal(false)
  savingHero = signal(false)

  // List loading states
  loadingServices = signal(false)
  loadingProducts = signal(false)
  loadingNews = signal(false)
  loadingContacts = signal(false)

  // Lists
  services = signal<CmsService[]>([])
  products = signal<CmsProduct[]>([])
  news = signal<CmsNewsArticle[]>([])
  contacts = signal<ContactInquiry[]>([])

  // Dialog visibility
  serviceDialogVisible = signal(false)
  productDialogVisible = signal(false)
  newsDialogVisible = signal(false)
  replyDialogVisible = signal(false)

  // Which item is being edited (null = create mode)
  editingServiceId = signal<string | null>(null)
  editingProductId = signal<string | null>(null)
  editingNewsId = signal<string | null>(null)
  replyingContact = signal<ContactInquiry | null>(null)
  sendingReply = signal(false)

  // ─── Forms ────────────────────────────────────────────────────────

  configForm = this.fb.nonNullable.group({
    companyName: ['', Validators.required],
    tagline: ['', Validators.required],
    primaryColor: ['#2563eb'],
    accentColor: ['#7c3aed'],
  })

  heroForm = this.fb.nonNullable.group({
    badge: ['', Validators.required],
    headline: ['', Validators.required],
    headlineAccent: ['', Validators.required],
    subheadline: ['', Validators.required],
    ctaPrimary: ['', Validators.required],
    ctaSecondary: ['', Validators.required],
    statValue: ['', Validators.required],
    statLabel: ['', Validators.required],
  })

  serviceForm = this.fb.nonNullable.group({
    icon: ['', Validators.required],
    title: ['', Validators.required],
    description: ['', Validators.required],
    features: [''],
    highlighted: [false],
    sortOrder: [0],
    active: [true],
  })

  productForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    imageAlt: [''],
    badge: [''],
    sortOrder: [0],
    active: [true],
  })

  newsForm = this.fb.nonNullable.group({
    category: ['', Validators.required],
    date: ['', Validators.required],
    title: ['', Validators.required],
    excerpt: ['', Validators.required],
    active: [true],
  })

  replyForm = this.fb.nonNullable.group({
    subject: ['', Validators.required],
    body: ['', [Validators.required, Validators.minLength(10)]],
  })

  contactStatusOptions = [
    { label: 'Nuevo', value: 'NEW' },
    { label: 'Leído', value: 'READ' },
    { label: 'Respondido', value: 'REPLIED' },
  ]

  ngOnInit(): void {
    this.loadConfig()
    this.loadHero()
    this.loadServices()
    this.loadProducts()
    this.loadNews()
    this.loadContacts()
  }

  // ─── Config ───────────────────────────────────────────────────────

  loadConfig(): void {
    this.cmsService.getConfig().subscribe({
      next: (res) => { if (res.success) this.configForm.patchValue(res.data) },
    })
  }

  saveConfig(): void {
    if (this.configForm.invalid) { this.configForm.markAllAsTouched(); return }
    this.savingConfig.set(true)
    this.cmsService.updateConfig(this.configForm.getRawValue()).subscribe({
      next: (res) => {
        if (res.success) this.toast('success', 'Configuración guardada')
        this.savingConfig.set(false)
      },
      error: () => { this.toast('error', 'No se pudo guardar la configuración'); this.savingConfig.set(false) },
    })
  }

  // ─── Hero ─────────────────────────────────────────────────────────

  loadHero(): void {
    this.cmsService.getHero().subscribe({
      next: (res) => { if (res.success) this.heroForm.patchValue(res.data) },
    })
  }

  saveHero(): void {
    if (this.heroForm.invalid) { this.heroForm.markAllAsTouched(); return }
    this.savingHero.set(true)
    this.cmsService.updateHero(this.heroForm.getRawValue()).subscribe({
      next: (res) => {
        if (res.success) this.toast('success', 'Hero actualizado')
        this.savingHero.set(false)
      },
      error: () => { this.toast('error', 'No se pudo guardar el hero'); this.savingHero.set(false) },
    })
  }

  // ─── Services ─────────────────────────────────────────────────────

  loadServices(): void {
    this.loadingServices.set(true)
    this.cmsService.getServices().subscribe({
      next: (res) => {
        if (res.success) this.services.set(res.data)
        this.loadingServices.set(false)
      },
      error: () => this.loadingServices.set(false),
    })
  }

  openNewService(): void {
    this.editingServiceId.set(null)
    this.serviceForm.reset({ highlighted: false, active: true, sortOrder: 0, features: '' })
    this.serviceDialogVisible.set(true)
  }

  openEditService(svc: CmsService): void {
    this.editingServiceId.set(svc.id)
    this.serviceForm.patchValue({ ...svc, features: svc.features.join(', ') })
    this.serviceDialogVisible.set(true)
  }

  saveService(): void {
    if (this.serviceForm.invalid) { this.serviceForm.markAllAsTouched(); return }
    const raw = this.serviceForm.getRawValue()
    const payload = {
      ...raw,
      features: raw.features.split(',').map((f: string) => f.trim()).filter(Boolean),
    }
    const id = this.editingServiceId()
    const req = id ? this.cmsService.updateService(id, payload) : this.cmsService.createService(payload)
    req.subscribe({
      next: (res) => {
        if (res.success) {
          this.toast('success', 'Servicio guardado')
          this.serviceDialogVisible.set(false)
          this.loadServices()
        }
      },
      error: () => this.toast('error', 'No se pudo guardar el servicio'),
    })
  }

  confirmDeleteService(svc: CmsService): void {
    this.confirmService.confirm({
      message: `¿Eliminar el servicio "${svc.title}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.cmsService.deleteService(svc.id).subscribe({
        next: () => { this.toast('success', 'Servicio eliminado'); this.loadServices() },
        error: () => this.toast('error', 'No se pudo eliminar'),
      }),
    })
  }

  // ─── Products ─────────────────────────────────────────────────────

  loadProducts(): void {
    this.loadingProducts.set(true)
    this.cmsService.getProducts().subscribe({
      next: (res) => {
        if (res.success) this.products.set(res.data)
        this.loadingProducts.set(false)
      },
      error: () => this.loadingProducts.set(false),
    })
  }

  openNewProduct(): void {
    this.editingProductId.set(null)
    this.productForm.reset({ active: true, sortOrder: 0, price: 0 })
    this.productDialogVisible.set(true)
  }

  openEditProduct(prod: CmsProduct): void {
    this.editingProductId.set(prod.id)
    this.productForm.patchValue(prod)
    this.productDialogVisible.set(true)
  }

  saveProduct(): void {
    if (this.productForm.invalid) { this.productForm.markAllAsTouched(); return }
    const id = this.editingProductId()
    const payload = this.productForm.getRawValue()
    const req = id ? this.cmsService.updateProduct(id, payload) : this.cmsService.createProduct(payload)
    req.subscribe({
      next: (res) => {
        if (res.success) {
          this.toast('success', 'Producto guardado')
          this.productDialogVisible.set(false)
          this.loadProducts()
        }
      },
      error: () => this.toast('error', 'No se pudo guardar el producto'),
    })
  }

  confirmDeleteProduct(prod: CmsProduct): void {
    this.confirmService.confirm({
      message: `¿Eliminar el producto "${prod.name}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.cmsService.deleteProduct(prod.id).subscribe({
        next: () => { this.toast('success', 'Producto eliminado'); this.loadProducts() },
        error: () => this.toast('error', 'No se pudo eliminar'),
      }),
    })
  }

  // ─── News ─────────────────────────────────────────────────────────

  loadNews(): void {
    this.loadingNews.set(true)
    this.cmsService.getNews().subscribe({
      next: (res) => {
        if (res.success) this.news.set(res.data)
        this.loadingNews.set(false)
      },
      error: () => this.loadingNews.set(false),
    })
  }

  openNewNews(): void {
    this.editingNewsId.set(null)
    this.newsForm.reset({ active: true })
    this.newsDialogVisible.set(true)
  }

  openEditNews(article: CmsNewsArticle): void {
    this.editingNewsId.set(article.id)
    this.newsForm.patchValue(article)
    this.newsDialogVisible.set(true)
  }

  saveNews(): void {
    if (this.newsForm.invalid) { this.newsForm.markAllAsTouched(); return }
    const id = this.editingNewsId()
    const payload = this.newsForm.getRawValue()
    const req = id ? this.cmsService.updateNews(id, payload) : this.cmsService.createNews(payload)
    req.subscribe({
      next: (res) => {
        if (res.success) {
          this.toast('success', 'Artículo guardado')
          this.newsDialogVisible.set(false)
          this.loadNews()
        }
      },
      error: () => this.toast('error', 'No se pudo guardar el artículo'),
    })
  }

  confirmDeleteNews(article: CmsNewsArticle): void {
    this.confirmService.confirm({
      message: `¿Eliminar el artículo "${article.title}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.cmsService.deleteNews(article.id).subscribe({
        next: () => { this.toast('success', 'Artículo eliminado'); this.loadNews() },
        error: () => this.toast('error', 'No se pudo eliminar'),
      }),
    })
  }

  // ─── Contacts ─────────────────────────────────────────────────────

  loadContacts(): void {
    this.loadingContacts.set(true)
    this.cmsService.getContacts().subscribe({
      next: (res) => {
        if (res.success) this.contacts.set(res.data)
        this.loadingContacts.set(false)
      },
      error: () => this.loadingContacts.set(false),
    })
  }

  updateContactStatus(contact: ContactInquiry, status: ContactInquiry['status']): void {
    this.cmsService.updateContactStatus(contact.id, status).subscribe({
      next: (res) => {
        if (res.success) {
          this.contacts.update(list => list.map(c => c.id === contact.id ? { ...c, status } : c))
        }
      },
    })
  }

  openReply(contact: ContactInquiry): void {
    this.replyingContact.set(contact)
    this.replyForm.reset({
      subject: `Re: Consulta sobre ${contact.serviceType} — ${contact.name}`,
      body: '',
    })
    this.replyDialogVisible.set(true)
  }

  sendReply(): void {
    if (this.replyForm.invalid) { this.replyForm.markAllAsTouched(); return }
    const contact = this.replyingContact()
    if (!contact) return
    this.sendingReply.set(true)
    this.cmsService.replyToContact(contact.id, this.replyForm.getRawValue()).subscribe({
      next: (res) => {
        if (res.success) {
          this.toast('success', `Respuesta enviada a ${contact.email}`)
          this.replyDialogVisible.set(false)
          this.contacts.update(list =>
            list.map(c => c.id === contact.id ? { ...c, status: 'REPLIED' as const } : c)
          )
        }
        this.sendingReply.set(false)
      },
      error: () => {
        this.toast('error', 'No se pudo enviar la respuesta')
        this.sendingReply.set(false)
      },
    })
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      NEW: 'info', READ: 'warn', REPLIED: 'success',
    }
    return map[status] ?? 'secondary'
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = { NEW: 'Nuevo', READ: 'Leído', REPLIED: 'Respondido' }
    return map[status] ?? status
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', minimumFractionDigits: 0,
    }).format(price)
  }

  private toast(severity: 'success' | 'error', detail: string): void {
    this.messageService.add({
      severity,
      summary: severity === 'success' ? 'Éxito' : 'Error',
      detail,
      life: 3000,
    })
  }
}
