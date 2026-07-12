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
import Image from "next/image";   // ✅ Correct import
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
  themeColor: "#0d3f1b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh overflow-x-hidden bg-black text-white">
        <AuthProvider>
          <div className="app-frame mx-auto min-h-dvh w-full max-w-[430px] relative overflow-hidden">
            <div className="app-bg" aria-hidden="true">
              <Image
                src="/image.jpg"   // ✅ served from public/
                alt=""
                fill
                priority
                sizes="(max-width: 430px) 100vw, 430px"
                className="object-cover object-center"
              />
              <div className="app-bg-overlay" />
              <div className="app-bg-vignette" />
              <div className="app-bg-grain" />
              <div className="app-top-fade" />
              <div className="app-bottom-fade" />
            </div>

            <div className="app-content relative z-10 min-h-dvh">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
