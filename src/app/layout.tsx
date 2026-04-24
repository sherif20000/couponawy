import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "كوبوناوي — كوبونات وعروض موثوقة من الأستاذ أبو عبدالله",
    template: "%s | كوبوناوي",
  },
  description:
    "كوبونات خصم وعروض مختارة بعناية للمتاجر الموثوقة في السعودية والخليج. جربها قبلك الأستاذ أبو عبدالله.",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "كوبوناوي",
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "ar-SA": SITE_URL,
      ar: SITE_URL,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
    >
      <body className="bg-cream text-charcoal font-body min-h-full flex flex-col">
        {/* Google Analytics — only loads when NEXT_PUBLIC_GA_ID is set */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
        {/* Skip to main content — visible only on keyboard focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-brand-red focus:px-5 focus:py-3 focus:font-body focus:text-sm focus:font-semibold focus:text-cream focus:shadow-lg"
        >
          الانتقال إلى المحتوى الرئيسي
        </a>
        <Header />
        <div id="main-content" className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <Toaster
          position="top-center"
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: "var(--font-cairo), system-ui, sans-serif",
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
