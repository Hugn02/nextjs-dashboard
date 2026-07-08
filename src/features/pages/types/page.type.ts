export interface SitePage {
  id?: string
  key: string
  title?: string
  subtitle?: string
  content?: string
  videoUrl?: string
  address?: string
  phone?: string
  email?: string
  metadata?: Record<string, any>
  updatedAt?: string
}
