import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Nexus | Professional AI SaaS",
  description: "Next-generation AI chat platform with real-time streaming, image generation, and secure history.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#0b0b0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased selection:bg-blue-500/30`}>
        {children}
      </body>
    </html>
  );
}
