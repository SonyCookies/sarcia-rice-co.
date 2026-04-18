import type { Metadata } from "next";
import { Geist_Mono, Lexend, Poppins } from "next/font/google";

import AuthBootstrap from "@/app/_components/auth-bootstrap";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarcia Rice Co.",
  description:
    "Order fresh rice online, manage deliveries, and keep household staples on schedule.",
  formatDetection: {
    telephone: false,
  },
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
        {children}
      </body>
    </html>
  );
}
