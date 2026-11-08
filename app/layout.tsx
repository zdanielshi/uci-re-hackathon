import type { Metadata, Viewport } from "next";
import { Anton, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Build Baby Build",
  description: "Your autonomous housing lobbyist. Find every decision-maker. Run the campaign.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0d5c3a",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} ${spaceMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
