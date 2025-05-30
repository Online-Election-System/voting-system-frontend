"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Vote, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Elections",
    href: "/elections",
    icon: Vote,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
]

export default function Navbar() {
  const pathname = usePathname()

  const handleLogout = () => {
    // In a real app, you would handle logout logic here
    window.location.href = "/login"
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Vote className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Election System</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </nav>
        <div className="flex md:hidden">{/* Mobile menu button would go here */}</div>
      </div>
    </header>
  )
}
