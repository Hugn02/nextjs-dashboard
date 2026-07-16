import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
  const productApiUrl = process.env.NEXT_PUBLIC_PRODUCT_API_URL || "http://localhost:3002/api/products";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/products/all`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Dynamic Product routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${productApiUrl}?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const rawProducts = Array.isArray(data) ? data : (data.data?.products || data.data || []);
      productRoutes = rawProducts
        .filter((p: any) => p.slug && p.status !== "hidden")
        .map((p: any) => ({
          url: `${siteUrl}/products/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error("Sitemap: failed to fetch products:", error);
  }

  // Dynamic Collection routes
  let collectionRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/collections?isActive=true`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const rawCollections = Array.isArray(data) ? data : (data.data || []);
      collectionRoutes = rawCollections
        .filter((c: any) => c.slug)
        .map((c: any) => ({
          url: `${siteUrl}/collections/${c.slug}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch (error) {
    console.error("Sitemap: failed to fetch collections:", error);
  }

  // Dynamic News routes
  let newsRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/news?isPublished=true`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const rawNews = Array.isArray(data) ? data : (data.data || []);
      newsRoutes = rawNews
        .filter((n: any) => n.slug)
        .map((n: any) => ({
          url: `${siteUrl}/news/${n.slug}`,
          lastModified: n.updatedAt ? new Date(n.updatedAt) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }));
    }
  } catch (error) {
    console.error("Sitemap: failed to fetch news articles:", error);
  }

  return [
    ...staticRoutes,
    ...productRoutes,
    ...collectionRoutes,
    ...newsRoutes,
  ];
}
