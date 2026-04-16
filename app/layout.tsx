import "./globals.css";

export const metadata = { title: "Cortex AI", description: "AI Assistant" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
