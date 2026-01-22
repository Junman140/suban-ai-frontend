import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import { ThemeProvider } from "@/components/ThemeToggle";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Likable AI - Voice Companion & Market Analysis",
  description: "Your personal AI companion for voice conversations, chart scenarios, emotional processing, and risk management. Powered by Solana blockchain.",
  keywords: ["AI", "voice assistant", "market analysis", "trading", "risk management", "Solana", "crypto"],
  authors: [{ name: "Likable AI" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Likable AI",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: "Likable AI",
    description: "Your personal AI companion for voice conversations and market analysis",
  },
  twitter: {
    card: "summary_large_image",
    title: "Likable AI",
    description: "Your personal AI companion for voice conversations and market analysis",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Likable AI" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" id="theme-color-meta" />
      </head>
      <body
        className={`${inter.variable} antialiased page-transition`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SolanaWalletProvider>
            <div className="page-transition">
              {children}
            </div>
            <Toaster richColors position="bottom-center" closeButton />
          </SolanaWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
