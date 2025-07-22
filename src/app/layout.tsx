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
  title: "TaskMentor.io",
  description: "Your Personal Productivity Mentor",
  keywords:
    "azent, taskmentor.io, taskmentor, task management, productivity, task tracker, project management, to-do list, task organizer",
  authors: [{ name: "Binit KC" }],
  openGraph: {
    title: "TaskMentor.io",
    description: "Your Personal Productivity Mentor",
    type: "website",
    locale: "en_US",
    siteName: "taskmentor.io",
    images: [
      {
        url: "https://taskmentor.io/logo.png",
        alt: "taskmentor.io",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskMentor.io",
    description: "Your Personal Productivity Mentor",
    images: [
      {
        url: "https://taskmentor.io/logo.png",
        alt: "taskmentor.io",
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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
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
