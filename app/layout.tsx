import type { Metadata } from "next";
import { PwaRegister } from "@/components/pwa/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "My Weather App",
  title: "My Weather App",
  description: "A responsive weather dashboard for current conditions and daily forecasts.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Weather App"
  },
  icons: {
    apple: [{ url: "/icons/weather-maskable.svg", type: "image/svg+xml" }],
    icon: [{ url: "/icons/weather-icon.svg", type: "image/svg+xml" }]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
