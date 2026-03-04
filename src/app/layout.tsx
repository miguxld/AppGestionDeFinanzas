// src/app/layout.tsx
// Root layout — providers, fonts, global styles

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Finanzas — Control Financiero Personal",
  description: "Gestiona tus ingresos, egresos, ahorros e ingresos extraordinarios en un solo lugar.",
  keywords: ["finanzas personales", "ahorro", "presupuesto", "ingresos", "egresos"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#0a0f1e] font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
