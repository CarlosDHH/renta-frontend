import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/components/layout/layout';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/landing/landing.routes').then((m) => m.landingRoutes),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('./features/customers/customers.routes').then((m) => m.customersRoutes),
      },
      {
        path: 'plans',
        loadChildren: () =>
          import('./features/plans/plans.routes').then((m) => m.plansRoutes),
      },
      {
        path: 'contracts',
        loadChildren: () =>
          import('./features/contracts/contracts.routes').then((m) => m.contractsRoutes),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/payments/payments.routes').then((m) => m.paymentsRoutes),
      },
      {
        path: 'receipts',
        loadChildren: () =>
          import('./features/receipts/receipts.routes').then((m) => m.receiptsRoutes),
      },
      {
        path: 'landing-cms',
        loadChildren: () =>
          import('./features/landing-cms/landing-cms.routes').then((m) => m.landingCmsRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
