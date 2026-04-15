import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { LandingContentService } from '../../services/landing-content.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly contentService = inject(LandingContentService);

  readonly content = this.contentService.content;
  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]{7,15}$/)]],
    serviceType: ['fiber', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly serviceOptions = [
    { value: 'fiber', label: 'Internet de Fibra Óptica' },
    { value: 'cameras', label: 'Instalación de Cámaras' },
    { value: 'networking', label: 'Red Empresarial' },
    { value: 'support', label: 'Soporte Técnico' },
    { value: 'products', label: 'Compra de Equipos' },
    { value: 'other', label: 'Otro' },
  ];

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    this.contactService.sendInquiry(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
        this.form.reset({ serviceType: 'fiber' });
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Ocurrió un error al enviar. Intenta de nuevo.');
      },
    });
  }
}
