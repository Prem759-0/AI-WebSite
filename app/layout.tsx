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
  themeColor: "#000000",
  // This tells the browser to use your animated GIF as the tab icon!
  icons: {
    icon: "/ai_logo_video.gif",
    apple: "/ai_logo_video.gif", // Also sets it for Apple devices if saved to home screen
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#000000] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
