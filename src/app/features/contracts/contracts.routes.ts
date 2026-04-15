import { Routes } from '@angular/router'
import { roleGuard } from '../../core/guards/role.guard'

export const contractsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/contract-list.component').then((m) => m.ContractListComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/form/contract-form.component').then((m) => m.ContractFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] },
  },
]
