import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingContentService } from '../../services/landing-content.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: '../../styles/style.scss',
})
export class ServicesComponent {
  private readonly contentService = inject(LandingContentService);
  readonly content = this.contentService.content;
}
