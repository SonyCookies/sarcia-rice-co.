import type { Metadata, Viewport } from "next";
import { Geist_Mono, Lexend, Poppins } from "next/font/google";

import AuthBootstrap from "@/app/_components/auth-bootstrap";
import PwaRegister from "@/app/_components/pwa-register";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sarcia Rice Co.",
  description:
    "Order fresh rice online, manage deliveries, and keep household staples on schedule.",
  applicationName: "Sarcia Rice Co.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sarcia Rice Co.",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4d6b35",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lexend.variable} ${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthBootstrap />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
