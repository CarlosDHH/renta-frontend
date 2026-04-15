import { Routes } from '@angular/router'

export const landingCmsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing-cms-page/landing-cms-page.component').then(
        (m) => m.LandingCmsPageComponent
      ),
  },
]
