import { Routes } from '@angular/router'
import { roleGuard } from '../../core/guards/role.guard'

export const plansRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/plan-list.component').then((m) => m.PlanListComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/form/plan-form.component').then((m) => m.PlanFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/form/plan-form.component').then((m) => m.PlanFormComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] },
  },
]
