import type { Metadata } from "next";
import { Noto_Kufi_Arabic, Tajawal, Amiri } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";
import "./globals.css";

const notoKufi = Noto_Kufi_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-noto-kufi",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://couponawy.com"
  ),
  title: {
    default: "كوبوناوي — أكوبونات وعروض موثوقة من الأستاذ أبو عبدالله",
    template: "%s | كوبوناوي",
  },
  description:
    "كوبونات خصم وعروض مختارة بعناية للمتاجر الموثوقة في السعودية والخليج. جربها قبلك الأستاذ أبو عبدالله.",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "كوبوناوي",
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
      className={`${notoKufi.variable} ${tajawal.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="bg-cream text-charcoal font-body min-h-full flex flex-col">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
        <Toaster
          position="top-center"
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: "var(--font-tajawal), system-ui, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
