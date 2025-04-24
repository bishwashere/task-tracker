import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "Task Management Finally Done Right.",
  keywords:
    "task management, productivity, task tracker, project management, to-do list, task organizer",
  authors: [{ name: "Binit KC" }],
  openGraph: {
    title: "Task Tracker",
    description: "Task Management Finally Done Right.",
    type: "website",
    locale: "en_US",
    siteName: "azent.io",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>

        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
