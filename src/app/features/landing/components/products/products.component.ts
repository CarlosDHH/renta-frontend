import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingContentService } from '../../services/landing-content.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrl: '../../styles/style.scss',
})
export class ProductsComponent {
  private readonly contentService = inject(LandingContentService);
  readonly content = this.contentService.content;

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  }

  getProductIcon(id: string): string {
    const icons: Record<string, string> = {
      'hub-one': 'wifi',
      'cam-4k': 'video',
      'switch-pro': 'share-alt',
      'nas-storage': 'database',
    };
    return icons[id] ?? 'desktop';
  }
}
