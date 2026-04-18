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
  themeColor: "#fcfcfd",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#fcfcfd] text-gray-900 overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
