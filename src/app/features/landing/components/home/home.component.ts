import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ServicesComponent } from '../../components/services/services.component';
import { ProductsComponent } from '../../components/products/products.component';
import { NewsComponent } from '../../components/news/news.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    ServicesComponent,
    ProductsComponent,
    NewsComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    <app-landing-navbar />
    <main>
      <app-hero />
      <app-services />
      <app-products />
      <app-news />
      <app-contact />
    </main>
    <app-landing-footer />
  `,
  styleUrl: '../../styles/style.scss',  // ← agrega esto
})
export class HomeComponent {}
