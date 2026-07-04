import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Weather App",
  description: "A responsive weather dashboard for current conditions and daily forecasts."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
