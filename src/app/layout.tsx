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
  themeColor: "#000000", 
};
/*
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#12141a] text-white overflow-x-hidden">
        <AuthProvider>
          {/* Main App Container with the bg.jpg background *}
          <div className="mx-auto min-h-dvh w-full max-w-[430px] scenery-bg overflow-hidden relative shadow-2xl">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

*/

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-black text-white overflow-x-hidden">
        <AuthProvider>
          {/* Main App Container: Removed 'scenery-bg' for a clean black slate */}
          <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-black overflow-hidden relative shadow-2xl">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}