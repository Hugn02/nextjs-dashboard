// app/layout.tsx
import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/src/layout/ChatWidget";

export const metadata: Metadata = {
  title: "Noritake Vietnam — Sứ Cao Cấp Số 1 Nhật Bản",
  description: "Website chính thức Noritake tại Việt Nam",
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
  return (
    <html lang="vi" className={cormorant.className}>
      <body className="antialiased bg-white text-[#2c1a00]">
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}