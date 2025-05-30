import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, Users, Home } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard | E-Voting System",
  description: "Admin dashboard for managing the e-voting system",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-6">
          <h2 className="text-xl font-bold">E-Voting Admin</h2>
        </div>
        <nav className="mt-6">
          <Link
            href="/admin"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link
            href="/admin/candidates"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Users className="h-5 w-5 mr-3" />
            Candidates
          </Link>
          <Link
            href="/admin/elections"
            className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Calendar className="h-5 w-5 mr-3" />
            Elections
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}

