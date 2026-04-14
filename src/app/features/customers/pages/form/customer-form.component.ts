import { Component, inject, OnInit, signal } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { InputTextModule } from 'primeng/inputtext'
import { InputMaskModule } from 'primeng/inputmask'
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'

import { CustomerService } from '../../services/customer.service'

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    InputMaskModule,
    SelectModule,
    ButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder)
  private customerService = inject(CustomerService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService)

  loading = signal(false)
  isEdit = signal(false)
  customerId = signal<string | null>(null)

  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ]

  form = this.fb.group({
    name:         ['', [Validators.required]],
    lastName:     ['', [Validators.required]],
    phone:        ['', [Validators.required]],
    email:        ['', [Validators.email]],
    municipality: [''],
    city:         [''],
    active:       [true],
  })

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.isEdit.set(true)
      this.customerId.set(id)
      this.loadCustomer(id)
    }
  }

  loadCustomer(id: string): void {
    this.loading.set(true)
    this.customerService.getById(id).subscribe({
      next: (res) => {
        if (res.success) {
          const { name, lastName, phone, email, municipality, city, active } = res.data
          this.form.patchValue({ name, lastName, phone, email, municipality, city, active })
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el cliente' })
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
        lastName: value.lastName,
        phone: value.phone,
        email: value.email || undefined,
        municipality: value.municipality || undefined,
        city: value.city || undefined,
        active: value.active,
      }
      this.customerService.update(this.customerId()!, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado' })
            setTimeout(() => this.router.navigate(['/admin/customers']), 1500)
          }
          this.loading.set(false)
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el cliente' })
          this.loading.set(false)
        },
      })
    } else {
      const payload: any = {
        name: value.name,
        lastName: value.lastName,
        phone: value.phone,
        email: value.email || undefined,
        municipality: value.municipality || undefined,
        city: value.city || undefined,
      }
      this.customerService.create(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado' })
            setTimeout(() => this.router.navigate(['/admin/customers']), 1500)
          }
          this.loading.set(false)
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el cliente' })
          this.loading.set(false)
        },
      })
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/customers'])
  }
}
