import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/providers/query-provider";
import { cn } from "@/lib/cn";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Azent.io | Streamlined Task Mastery",
  description: "Task Tracking with ease and clarity.",
  keywords:
    "azent, azent.io, task management, productivity, task tracker, project management, to-do list, task organizer",
  authors: [{ name: "Binit KC" }],
  openGraph: {
    title: "Azent.io | Streamlined Task Mastery",
    description: "Task Tracking with ease and clarity.",
    type: "website",
    locale: "en_US",
    siteName: "azent.io",
    images: [
      {
        url: "https://www.azent.io/logo.png",
        alt: "azent.io",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Azent.io | Streamlined Task Mastery",
    description: "Task Tracking with ease and clarity.",
    images: [
      {
        url: "https://www.azent.io/logo.png",
        alt: "azent.io",
      }
    ]
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "bg-white",
        )}
      >
        <QueryProvider>
          <SessionProvider>{children}</SessionProvider>
          <Toaster position="top-center" reverseOrder={false} />
        </QueryProvider>
      </body>
    </html>
  );
}
