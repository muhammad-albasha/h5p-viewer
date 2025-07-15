import "reflect-metadata";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/auth/AuthProvider";
import Footer from "./components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "H5P Viewer",
  description: "Eine interaktive Plattform für H5P Inhalte",
  icons: {
    icon: [
      { url: "/h5p-viewer/favicon.ico", sizes: "any" },
      { url: "/h5p-viewer/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/h5p-viewer/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: "/h5p-viewer/apple-touch-icon.png"
  },
  manifest: "/h5p-viewer/manifest.json",
  themeColor: "#2563eb"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
