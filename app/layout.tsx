import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ weight: ["400", "600"], subsets: ["latin"], display: "swap", variable: "--font-brand" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://merchantmagix.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MerchantMagix - Ecommerce Website Development Agency",
    template: "%s | MerchantMagix",
  },
  description:
    "We build stunning Shopify stores and custom ecommerce websites that convert. Expert web development for growing businesses. Shopify from $799, custom builds from $2,499.",
  keywords: [
    "ecommerce development",
    "shopify store",
    "shopify developer",
    "custom ecommerce",
    "online store development",
    "ecommerce agency",
    "web development",
  ],
  authors: [{ name: "MerchantMagix", url: siteUrl }],
  creator: "MerchantMagix",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "MerchantMagix",
    title: "MerchantMagix - Ecommerce Website Development Agency",
    description:
      "We build stunning Shopify stores and custom ecommerce websites that convert. Expert web development for growing businesses.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MerchantMagix - Ecommerce Website Development",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MerchantMagix - Ecommerce Website Development Agency",
    description: "We build stunning Shopify stores and custom ecommerce websites that convert.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MerchantMagix",
    description: "Ecommerce website development agency. We build Shopify stores and custom ecommerce websites.",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      url: `${siteUrl}/contact`,
      areaServed: "Worldwide",
    },
    service: [
      {
        "@type": "Service",
        name: "Shopify Store Development",
        description: "Custom Shopify store setup and theme development.",
      },
      {
        "@type": "Service",
        name: "Custom Ecommerce Development",
        description: "Fully custom ecommerce websites built with React and Next.js.",
      },
    ],
  };

  return (
    <html lang="en" className={cormorant.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
