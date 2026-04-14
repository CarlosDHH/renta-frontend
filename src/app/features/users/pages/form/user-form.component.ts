import { Component, inject, OnInit, signal } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { InputTextModule } from 'primeng/inputtext'
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select'
import { ButtonModule } from 'primeng/button'
import { ToastModule } from 'primeng/toast'
import { PasswordModule } from 'primeng/password'
import { MessageService } from 'primeng/api'

import { UserService } from '../../services/user.service'

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    ToastModule,
    PasswordModule,
    InputMaskModule,
  ],
  providers: [MessageService],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder)
  private userService = inject(UserService)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private messageService = inject(MessageService)

  loading = signal(false)
  isEdit = signal(false)
  userId = signal<string | null>(null)

  roles = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Operador', value: 'OPERATOR' },
  ]

  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ]

  form = this.fb.group({
    name:     ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email:    ['', [Validators.required, Validators.email]],
    phone:    ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
    role:     ['OPERATOR', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    active:   [true],
  })

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')

    if (id) {
      this.isEdit.set(true)
      this.userId.set(id)
      this.form.get('password')?.clearValidators()
      this.form.get('password')?.updateValueAndValidity()
      this.loadUser(id)
    }
  }

  loadUser(id: string): void {
    this.loading.set(true)
    this.userService.getById(id).subscribe({
      next: (res) => {
        if (res.success) {
          const { name, lastName, email, phone, role, active } = res.data
          this.form.patchValue({ name, lastName, email, phone, role, active })
        }
        this.loading.set(false)
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el usuario' })
        this.loading.set(false)
      }
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
        role: value.role,
        active: value.active,
      }

      this.userService.update(this.userId()!, payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' })
            setTimeout(() => this.router.navigate(['/admin/users']), 1500)
          }
          this.loading.set(false)
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el usuario' })
          this.loading.set(false)
        }
      })
    } else {
      this.userService.create(value as any).subscribe({
        next: (res) => {
          if (res.success) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado' })
            setTimeout(() => this.router.navigate(['/admin/users']), 1500)
          }
          this.loading.set(false)
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el usuario' })
          this.loading.set(false)
        }
      })
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users'])
  }
}
