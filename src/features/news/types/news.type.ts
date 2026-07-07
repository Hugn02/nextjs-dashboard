export interface NewsArticle {
  id: string
  title: string
  slug: string
  thumbnail?: string
  excerpt?: string
  content: string
  author?: string
  tags?: string[]
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  updatedAt?: string
}
