/*

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";

export const metadata: Metadata = {
  title: "Incredible Karnataka",
  description: "Discover authentic places, hidden gems and local stories across Karnataka",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-black text-white overflow-x-hidden">
        <AuthProvider>
          <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-black overflow-hidden relative shadow-2xl">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

*/


import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";

export const metadata: Metadata = {
  title: "Incredible Karnataka",
  description: "Discover authentic places, hidden gems and local stories across Karnataka",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0b3f1b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh overflow-x-hidden text-white">
        <AuthProvider>
          <div className="app-shell mx-auto min-h-dvh w-full max-w-[430px] overflow-hidden relative">
            <div className="app-sky" />
            <div className="app-sky-glow" />
            <div className="app-sun" />
            <div className="app-cloud app-cloud-1" />
            <div className="app-cloud app-cloud-2" />
            <div className="app-cloud app-cloud-3" />
            <div className="app-mist" />
            <div className="app-hill app-hill-back" />
            <div className="app-hill app-hill-mid" />
            <div className="app-hill app-hill-front" />
            <div className="app-forest-line" />
            <div className="app-forest-line app-forest-line-2" />
            <div className="app-foreground-sheen" />
            <div className="app-notches" />

            <div className="app-content relative z-10 min-h-dvh">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}