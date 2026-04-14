import { Routes } from '@angular/router'
import { roleGuard } from '../../core/guards/role.guard'

export const customersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/customer-list.component').then((m) => m.CustomerListComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/form/customer-form.component').then((m) => m.CustomerFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/form/customer-form.component').then((m) => m.CustomerFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] },
  },
]
