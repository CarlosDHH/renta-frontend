import { Component, inject } from '@angular/core';
import { LandingContentService } from '../../services/landing-content.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: '../../styles/style.scss',
})
export class HeroComponent {
  private readonly contentService = inject(LandingContentService);
  readonly content = this.contentService.content;

  readonly tickerItems = [
    'Residencial Lomas del Valle — Fibra 1 Gbps',
    'Corporativo Torre Sur — Red LAN/WAN',
    'Hotel Marqués — CCTV 4K',
    'Clínica Médica Central — Fibra + VPN',
    'Restaurante El Patio — WiFi 6 Empresarial',
    'Plaza Comercial Norte — Red Gestionada',
  ];
}
