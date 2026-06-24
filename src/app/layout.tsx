import type { Metadata, Viewport } from "next";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velo CRM",
  description: "CRM система за велосипеден сервиз",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body className="min-h-screen text-sm antialiased">
        <Sidebar />
        <main className="lg:pl-64">{children}</main>
      </body>
    </html>
  );
}
