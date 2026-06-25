import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Sidebar } from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velo CRM",
  description: "CRM система за велосипеден сервиз",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Touch headers() so this layout runs per request instead of being statically optimized.
  headers();

  const user = await getCurrentUser();

  return (
    <html lang="bg">
      <body className="min-h-screen text-sm antialiased">
        {user ? (
          <>
            <Sidebar user={user} />
            <main className="lg:pl-64">{children}</main>
          </>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
