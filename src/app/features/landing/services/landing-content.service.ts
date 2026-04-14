import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LandingContent } from '../models/landing-content.model';
import { NetworkService } from '../../../core/services/network.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LandingContentService {
  private http = inject(HttpClient);
  private networkService = inject(NetworkService);

  private readonly _content = signal<LandingContent>(this.getDefaultContent());
  readonly content = this._content.asReadonly();

  constructor() {
    this.loadFromApi();
  }

  private loadFromApi(): void {
    if (!this.networkService.isOnline()) return;
    this.http
      .get<{ success: boolean; data: LandingContent }>(`${environment.apiUrl}/landing/content`)
      .subscribe({
        next: (res) => { if (res.success && res.data) this._content.set(res.data); },
        error: () => { /* backend aún no implementado — se usan los valores predeterminados */ },
      });
  }

  private getDefaultContent(): LandingContent {
    return {
      companyName: 'NexLink',
      tagline: 'Precisión en Conectividad',
      primaryColor: '#1a56db',
      accentColor: '#0e9f6e',
      hero: {
        badge: 'Soluciones Tecnológicas',
        headline: 'Conectividad',
        headlineAccent: 'sin límites.',
        subheadline:
          'Instalamos, configuramos y mantenemos la infraestructura tecnológica que tu hogar o negocio necesita. Internet de fibra óptica, cámaras de seguridad y más.',
        ctaPrimary: 'Solicitar información',
        ctaSecondary: 'Ver servicios',
        statValue: '99.9%',
        statLabel: 'Uptime garantizado en nuestra red de fibra óptica.',
      },
      services: [
        {
          id: 'fiber',
          icon: 'wifi',
          title: 'Internet de Fibra Óptica',
          description:
            'Velocidades simétricas desde 200 Mbps hasta 10 Gbps. Sin límites de datos, sin interrupciones.',
          features: ['Hasta 10 Gbps simétrico', 'Sin límite de datos', 'Instalación incluida', 'Soporte 24/7'],
          highlighted: true,
        },
        {
          id: 'cameras',
          icon: 'video',
          title: 'Instalación de Cámaras',
          description:
            'Sistemas de videovigilancia IP para hogares y negocios. Monitoreo remoto desde tu celular.',
          features: ['Cámaras HD y 4K', 'Visión nocturna', 'Acceso remoto', 'Almacenamiento en la nube'],
        },
        {
          id: 'networking',
          icon: 'sitemap',
          title: 'Redes Empresariales',
          description:
            'Diseño e instalación de redes LAN/WAN, WiFi empresarial y soluciones de conectividad a medida.',
          features: ['WiFi 6 empresarial', 'VPN corporativa', 'Firewall administrado', 'Monitoreo de red'],
        },
        {
          id: 'support',
          icon: 'headphones',
          title: 'Soporte Técnico',
          description: 'Mantenimiento preventivo y correctivo para toda tu infraestructura tecnológica.',
          features: ['Respuesta en 2h', 'Técnicos certificados', 'Garantía en servicio', 'Contrato anual'],
        },
      ],
      products: [
        {
          id: 'hub-one',
          name: 'Router Mesh Pro',
          description: 'Cobertura total para tu hogar o negocio. WiFi 6, fácil configuración.',
          price: 2499,
          imageAlt: 'Router mesh moderno sobre fondo blanco',
          badge: 'Más vendido',
        },
        {
          id: 'cam-4k',
          name: 'Cámara 4K Exterior',
          description: 'Vigilancia HD con visión nocturna a color y detección de movimiento IA.',
          price: 1899,
          imageAlt: 'Cámara de seguridad 4K exterior',
        },
        {
          id: 'switch-pro',
          name: 'Switch Gestionado 24p',
          description: 'Switch profesional para redes empresariales. PoE+ integrado.',
          price: 3299,
          imageAlt: 'Switch de red profesional',
          badge: 'Nuevo',
        },
        {
          id: 'nas-storage',
          name: 'Almacenamiento NAS',
          description: 'Servidor NAS para respaldo local de cámaras y datos empresariales.',
          price: 4599,
          imageAlt: 'Dispositivo de almacenamiento NAS',
        },
      ],
      news: [
        {
          id: '1',
          category: 'Red',
          date: '12 Abr 2025',
          title: 'Latencia sub-1ms en centros urbanos con nuestra nueva tecnología fotónica',
          excerpt: 'Cómo nuestra nueva infraestructura está revolucionando la velocidad de transferencia de datos.',
        },
        {
          id: '2',
          category: 'Expansión',
          date: '5 Abr 2025',
          title: 'Ampliamos cobertura a 3 nuevas zonas metropolitanas',
          excerpt: 'Nuestra red de fibra óptica llega a más hogares y empresas en la región.',
        },
        {
          id: '3',
          category: 'Producto',
          date: '28 Mar 2025',
          title: 'NexLink OS: Gestión inteligente del tráfico en tiempo real',
          excerpt: 'La última actualización introduce priorización por IA para trabajo remoto y streaming.',
        },
      ],
    };
  }

  updateContent(content: Partial<LandingContent>): void {
    this._content.update((current) => ({ ...current, ...content }));
  }
}
