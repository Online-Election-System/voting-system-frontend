import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Grama Niladhari Election System",
  description: "Online Election Management System for Grama Niladhari",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main className="p-6 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  )
}
