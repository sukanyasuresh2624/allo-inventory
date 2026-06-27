import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Package } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Allo Inventory — Multi-Warehouse Reservation System",
  description:
    "Reserve products across multiple warehouses with real-time stock tracking and concurrency-safe checkout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-white">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h1 className="text-lg font-bold">Allo Inventory</h1>
                  <p className="text-xs text-gray-400">
                    Reservation System
                  </p>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-3">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md hover:bg-slate-800 transition"
                >
                  Home
                </Link>

                <Link
                  href="/api/products"
                  target="_blank"
                  className="px-3 py-2 rounded-md hover:bg-slate-800 transition"
                >
                  Products API
                </Link>

                <a
                  href="https://github.com/sukanyasuresh2624/allo-inventory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-700 hover:bg-slate-800 transition"
                >
                  GitHub
                </a>
              </nav>

              {/* Live Badge */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                  ● Live
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-950 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* About */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold">Allo Inventory</h3>
                </div>

                <p className="text-gray-400 text-sm">
                  A professional multi-warehouse inventory reservation system
                  built using modern web technologies.
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="font-semibold mb-3">Tech Stack</h3>

                <div className="flex flex-wrap gap-2">
                  {[
                    "Next.js",
                    "TypeScript",
                    "Prisma",
                    "Supabase",
                    "PostgreSQL",
                    "Tailwind CSS",
                    "Zod",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs rounded-full bg-slate-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features</h3>

                <ul className="text-gray-400 text-sm space-y-2">
                  <li>✅ Inventory Reservation</li>
                  <li>✅ Multi-Warehouse Support</li>
                  <li>✅ PostgreSQL Row Locking</li>
                  <li>✅ Auto Expiry with Vercel Cron</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-gray-500 text-sm">
                © 2026 Allo Inventory • Internship Project
              </p>

              <a
                href="https://github.com/sukanyasuresh2624/allo-inventory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
              >
                sukanyasuresh2624/allo-inventory
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}