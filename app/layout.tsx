import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BookDB - Discover Your Next Great Read",
  description:
    "A comprehensive book recommendation system with reviews, ratings, and personal library management.",
  generator: "ashutosh",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/GeistVF.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/GeistMonoVF.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        {/* Wrap your entire application with providers */}
        <AuthProvider>
          <WishlistProvider>
            <Header />
            <main>{children}</main>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
