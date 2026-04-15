import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'

export interface ApiResponse<T> {
  statusCode: number
  success: boolean
  message: string
  data: T
  errors?: string
}

export interface LandingConfig {
  companyName: string
  tagline: string
  primaryColor: string
  accentColor: string
}

export interface HeroCmsContent {
  badge: string
  headline: string
  headlineAccent: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
  statValue: string
  statLabel: string
}

export interface CmsService {
  id: string
  icon: string
  title: string
  description: string
  features: string[]
  highlighted: boolean
  sortOrder: number
  active: boolean
  updatedAt?: string
}

export interface CmsProduct {
  id: string
  name: string
  description: string
  price: number
  imageAlt: string
  badge?: string
  sortOrder: number
  active: boolean
  updatedAt?: string
}

export interface CmsNewsArticle {
  id: string
  category: string
  date: string
  title: string
  excerpt: string
  active: boolean
  updatedAt?: string
}

export interface ContactInquiry {
  id: string
  name: string
  email: string
  phone?: string
  serviceType: string
  message: string
  status: 'NEW' | 'READ' | 'REPLIED'
  createdAt: string
}

@Injectable({ providedIn: 'root' })
export class LandingCmsService {
  private http = inject(HttpClient)
  private apiUrl = `${environment.apiUrl}/landing`

  // ─── Config ───────────────────────────────────────────────────────
  getConfig(): Observable<ApiResponse<LandingConfig>> {
    return this.http.get<ApiResponse<LandingConfig>>(`${this.apiUrl}/config`)
  }

  updateConfig(payload: LandingConfig): Observable<ApiResponse<LandingConfig>> {
    return this.http.patch<ApiResponse<LandingConfig>>(`${this.apiUrl}/config`, payload)
  }

  // ─── Hero ─────────────────────────────────────────────────────────
  getHero(): Observable<ApiResponse<HeroCmsContent>> {
    return this.http.get<ApiResponse<HeroCmsContent>>(`${this.apiUrl}/hero`)
  }

  updateHero(payload: HeroCmsContent): Observable<ApiResponse<HeroCmsContent>> {
    return this.http.put<ApiResponse<HeroCmsContent>>(`${this.apiUrl}/hero`, payload)
  }

  // ─── Services ─────────────────────────────────────────────────────
  getServices(): Observable<ApiResponse<CmsService[]>> {
    return this.http.get<ApiResponse<CmsService[]>>(`${this.apiUrl}/services`)
  }

  createService(payload: Omit<CmsService, 'id' | 'updatedAt'>): Observable<ApiResponse<CmsService>> {
    return this.http.post<ApiResponse<CmsService>>(`${this.apiUrl}/services`, payload)
  }

  updateService(id: string, payload: Partial<Omit<CmsService, 'id'>>): Observable<ApiResponse<CmsService>> {
    return this.http.patch<ApiResponse<CmsService>>(`${this.apiUrl}/services/${id}`, payload)
  }

  deleteService(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/services/${id}`)
  }

  // ─── Products ─────────────────────────────────────────────────────
  getProducts(): Observable<ApiResponse<CmsProduct[]>> {
    return this.http.get<ApiResponse<CmsProduct[]>>(`${this.apiUrl}/products`)
  }

  createProduct(payload: Omit<CmsProduct, 'id' | 'updatedAt'>): Observable<ApiResponse<CmsProduct>> {
    return this.http.post<ApiResponse<CmsProduct>>(`${this.apiUrl}/products`, payload)
  }

  updateProduct(id: string, payload: Partial<Omit<CmsProduct, 'id'>>): Observable<ApiResponse<CmsProduct>> {
    return this.http.patch<ApiResponse<CmsProduct>>(`${this.apiUrl}/products/${id}`, payload)
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/products/${id}`)
  }

  // ─── News ─────────────────────────────────────────────────────────
  getNews(): Observable<ApiResponse<CmsNewsArticle[]>> {
    return this.http.get<ApiResponse<CmsNewsArticle[]>>(`${this.apiUrl}/news`)
  }

  createNews(payload: Omit<CmsNewsArticle, 'id' | 'updatedAt'>): Observable<ApiResponse<CmsNewsArticle>> {
    return this.http.post<ApiResponse<CmsNewsArticle>>(`${this.apiUrl}/news`, payload)
  }

  updateNews(id: string, payload: Partial<Omit<CmsNewsArticle, 'id'>>): Observable<ApiResponse<CmsNewsArticle>> {
    return this.http.patch<ApiResponse<CmsNewsArticle>>(`${this.apiUrl}/news/${id}`, payload)
  }

  deleteNews(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/news/${id}`)
  }

  // ─── Contacts ─────────────────────────────────────────────────────
  getContacts(): Observable<ApiResponse<ContactInquiry[]>> {
    return this.http.get<ApiResponse<ContactInquiry[]>>(`${this.apiUrl}/contacts`)
  }

  updateContactStatus(
    id: string,
    status: ContactInquiry['status'],
  ): Observable<ApiResponse<ContactInquiry>> {
    return this.http.patch<ApiResponse<ContactInquiry>>(`${this.apiUrl}/contacts/${id}`, { status })
  }

  replyToContact(
    id: string,
    payload: { subject: string; body: string },
  ): Observable<ApiResponse<ContactInquiry>> {
    return this.http.post<ApiResponse<ContactInquiry>>(
      `${this.apiUrl}/contacts/${id}/reply`,
      payload,
    )
  }
}
