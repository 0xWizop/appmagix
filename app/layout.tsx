import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ weight: ["400", "600"], subsets: ["latin"], display: "swap", variable: "--font-brand" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://webmint.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Webmint - Website & App Building Platform",
    template: "%s | Webmint",
  },
  description:
    "We build stunning websites and custom web apps that convert. Expert web development for growing businesses. Shopify from $799, custom builds from $2,499.",
  keywords: [
    "website builder",
    "web development",
    "app builder",
    "shopify store",
    "shopify developer",
    "custom website",
    "online store development",
    "web agency",
  ],
  authors: [{ name: "Webmint", url: siteUrl }],
  creator: "Webmint",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Webmint",
    title: "Webmint - Website & App Building Platform",
    description:
      "We build stunning websites and custom web apps that convert. Expert web development for growing businesses.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Webmint - Website & App Building Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Webmint - Website & App Building Platform",
    description: "We build stunning websites and custom web apps that convert.",
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
    name: "Webmint",
    description: "Website and app building platform. We build websites, web apps, and Shopify stores.",
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
