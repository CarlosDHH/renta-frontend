export interface HeroContent {
  badge: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  statValue: string;
  statLabel: string;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageAlt: string;
  badge?: string;
}

export interface NewsArticle {
  id: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
}

export interface LandingContent {
  hero: HeroContent;
  services: Service[];
  products: Product[];
  news: NewsArticle[];
  companyName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
}
