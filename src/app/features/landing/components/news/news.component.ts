import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingContentService } from '../../services/landing-content.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.component.html',
  styleUrl: '../../styles/style.scss',
})
export class NewsComponent {
  private readonly contentService = inject(LandingContentService);
  readonly content = this.contentService.content;
}
