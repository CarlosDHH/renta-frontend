import { Routes } from '@angular/router'
import { roleGuard } from '../../core/guards/role.guard'

export const paymentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/payment-list.component').then((m) => m.PaymentListComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/form/payment-form.component').then((m) => m.PaymentFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] },
  },
]
