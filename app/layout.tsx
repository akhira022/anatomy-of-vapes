import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans_Thai } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { NavigationProgressBar } from "@/components/layout/NavigationProgressBar";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemedToaster } from "@/components/theme/ThemedToaster";
import "./globals.css";

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบประชาสัมพันธ์ภัยบุหรี่ไฟฟ้าอัจฉริยะ | ส่องไส้ในบุหรี่ไฟฟ้า",
  description:
    "เรียนรู้ส่วนประกอบภายในบุหรี่ไฟฟ้า และสารพิษที่อันตรายต่อสุขภาพ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="th"
      className={`${ibmPlexSansThai.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          ข้ามไปเนื้อหาหลัก
        </a>
        <ThemeProvider>
          <NavigationProgressBar />
          {children}
          <ChatWidget />
          <ThemedToaster />
        </ThemeProvider>
        <Analytics />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
