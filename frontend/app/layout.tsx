import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FlowProvider from "@/providers/FlowProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ModernWeb - Modern Web Development Solutions",
    template: "%s | ModernWeb",
  },
  description:
    "Build modern web experiences with Next.js, TypeScript, and cutting-edge design systems. Professional web development services.",
  keywords: [
    "Next.js",
    "TypeScript",
    "Web Development",
    "React",
    "Modern Web",
    "UI/UX",
  ],
  authors: [{ name: "ModernWeb Team" }],
  creator: "ModernWeb",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://modernweb.dev",
    title: "ModernWeb - Modern Web Development Solutions",
    description:
      "Build modern web experiences with cutting-edge technology and thoughtful design.",
    siteName: "ModernWeb",
  },
  twitter: {
    card: "summary_large_image",
    title: "ModernWeb - Modern Web Development Solutions",
    description:
      "Build modern web experiences with cutting-edge technology and thoughtful design.",
    creator: "@modernweb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FlowProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </FlowProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
