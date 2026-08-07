import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menuberg | Affordable Restaurant Website Builder & QR Menu",

  description:
    "Create a professional restaurant website in minutes. Menuberg is an affordable restaurant website builder with QR menus, online ordering links, menu management, and custom branding. A simple alternative to Wix for restaurants.",

  keywords: [
    "restaurant website builder",
    "restaurant website",
    "restaurant website creator",
    "restaurant website software",
    "restaurant website platform",
    "QR menu",
    "digital restaurant menu",
    "restaurant menu website",
    "Wix alternative for restaurants",
    "restaurant website alternative",
    "restaurant marketing",
    "restaurant landing page",
    "online menu",
    "restaurant SaaS",
    "small restaurant website"
  ],

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-REWDKBMS40"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-REWDKBMS40');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}