import { Routes } from '@angular/router'
import { roleGuard } from '../../core/guards/role.guard'

export const receiptsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/receipt-list.component').then((m) => m.ReceiptListComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN', 'OPERATOR'] },
  },
]
