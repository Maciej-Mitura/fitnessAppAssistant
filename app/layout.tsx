import type { Metadata } from "next";

import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { Toaster } from "@/components/ui/sonner";
import { fontClassNames, fontSans } from "@/lib/fonts";
import {
  PWA_APP_NAME,
  PWA_BACKGROUND_COLOR,
  PWA_DESCRIPTION,
  PWA_SHORT_NAME,
} from "@/lib/pwa/config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: PWA_APP_NAME,
    template: `%s · ${PWA_APP_NAME}`,
  },
  description: PWA_DESCRIPTION,
  applicationName: PWA_APP_NAME,
  manifest: "/manifest.json",
  robots: {
    index: false,
    follow: false,
  },
  appleWebApp: {
    capable: true,
    title: PWA_SHORT_NAME,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
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
      className={`${fontClassNames} ${fontSans.className} dark h-full antialiased`}
      style={{ backgroundColor: PWA_BACKGROUND_COLOR }}
    >
      <body
        className="min-h-full bg-background font-sans text-foreground"
        style={{ backgroundColor: PWA_BACKGROUND_COLOR }}
      >
        {children}
        <Toaster richColors position="top-center" />
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
