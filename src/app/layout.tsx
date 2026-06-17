import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CustomCursor } from "@/components/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nova AI - Email and Calendar Reimagined",
  description:
    "An AI-powered Gmail + Google Calendar workspace with an agent chat interface.",
  icons: {
    icon: "/logo.svg",
  },
  verification: {
    google: "fcc1ReTzYdXebriWWlTxvFkZCZLknwyoxb1PDGUe7d4",
  },
};

import { AuthProviders } from "@/components/AuthProviders";

import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden" suppressHydrationWarning>
        <AuthProviders>
          <AnimatedBackground />
          <CustomCursor />
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: "glass !bg-white/80 dark:!bg-[#23232A]/90 !text-gray-900 dark:!text-white !border !border-white/20 dark:!border-white/10 !shadow-lg",
              style: {
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#FF9494',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'white',
                },
              },
            }}
          />
        </AuthProviders>
      </body>
    </html>
  );
}
