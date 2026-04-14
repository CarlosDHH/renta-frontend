import { Component, inject } from '@angular/core';
import { LandingContentService } from '../../services/landing-content.service';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: '../../styles/style.scss',
})
export class FooterComponent {
  private readonly contentService = inject(LandingContentService);
  readonly content = this.contentService.content;
  readonly year = new Date().getFullYear();
}
