// app/layout.tsx
import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/src/layout/ChatWidget";
import { CartProvider } from "@/src/features/cart/context/CartContext";
import CartAddedNotification from "@/src/features/cart/components/CartAddedNotification";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Bát Tràng Vietnam — Sứ Cao Cấp Số 1 Việt Nam",
    template: "%s | Bát Tràng"
  },
  description: "Website chính thức Bát Tràng tại Việt Nam - Tinh hoa gốm sứ cổ truyền, men hỏa biến cao cấp chế tác thủ công bởi các nghệ nhân.",
  keywords: ["gốm sứ bát tràng", "ấm trà bát tràng", "bát tràng vietnam", "gốm sứ cao cấp", "men hỏa biến", "ấm chén bát tràng"],
  openGraph: {
    title: "Bát Tràng Vietnam — Sứ Cao Cấp Số 1 Việt Nam",
    description: "Website chính thức Bát Tràng tại Việt Nam - Tinh hoa gốm sứ cổ truyền chế tác thủ công.",
    url: "./",
    siteName: "Bát Tràng Vietnam",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bát Tràng Vietnam — Sứ Cao Cấp Số 1 Việt Nam",
    description: "Website chính thức Bát Tràng tại Việt Nam",
  },
  alternates: {
    canonical: "./",
  }
};


const cormorant = Cormorant_Garamond({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "Bát Tràng Vietnam",
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/assets/logo2.png`,
          "caption": "Bát Tràng Vietnam Logo"
        },
        "sameAs": [
          "https://www.facebook.com/battrangvietnam"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Bát Tràng Vietnam",
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <html lang="vi" className={cormorant.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="antialiased bg-white text-[#2c1a00]">
        <CartProvider>
          {children}
          <ChatWidget />
          <CartAddedNotification />
        </CartProvider>
      </body>
    </html>
  );
}