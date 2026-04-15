import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LandingContentService } from '../../services/landing-content.service';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: '../../styles/style.scss',  // ← agrega esto
})
export class NavbarComponent {
  private readonly contentService = inject(LandingContentService);
  readonly content = this.contentService.content;
  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }
}
