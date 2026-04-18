import "./globals.css";
import { Inter } from "next/font/google";

// Inter is the standard font for high-end SaaS and AI apps
const inter = Inter({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata = {
  title: "Cortex AI | Advanced Intelligence",
  description: "Next-generation AI assistant powered by advanced models.",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Removed 'overflow-hidden' from the body tag so the landing page can scroll.
        Updated global background to #050505 (Deep Black) to match the dark UI. 
      */}
      <body className={`${inter.className} bg-[#050505] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
