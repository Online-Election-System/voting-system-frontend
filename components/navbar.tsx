"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Bell, Search, User, LogOut, ChevronDown, Menu, X } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Search Voters",
    url: "/search",
    icon: Search,
  },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-gray-200 border-b border-gray-300">
      <div className="max-w-7xl px-4 sm:px-6 mx-auto my-0 py-0 border-0 lg:px-0">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand - Left Side */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">GN</span>
            </div>
            <div>
              <h1 className="font-semibold text-lg text-black">System</h1>
              <p className="text-xs text-gray-600">Grama Niladhari Portal</p>
            </div>
          </div>

          {/* Navigation and User Menu - Right Side */}
          <div className="flex items-center gap-6">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <Link key={item.title} href={item.url}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white text-black border border-gray-300"
                          : "text-gray-700 hover:bg-white hover:text-black"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.title === "Notifications" && (
                        <Badge className="bg-red-500 text-white text-xs px-1.5 py-0 min-w-[18px] h-5">3</Badge>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-700 hover:bg-white hover:text-black relative"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">K.M. Silva</span>
                  <ChevronDown className="w-3 h-3" />
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-300">
                <div className="px-3 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-black">K.M. Silva</p>
                  <p className="text-xs text-gray-600">Grama Niladhari</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 text-gray-700 hover:text-black">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem className="flex items-center gap-2 text-gray-700 hover:text-black">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:bg-white hover:text-black"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-300 bg-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <Link key={item.title} href={item.url}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start gap-3 px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-white text-black border border-gray-300"
                          : "text-gray-700 hover:bg-white hover:text-black"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.title}
                      {item.title === "Notifications" && (
                        <Badge className="bg-red-500 text-white text-xs px-1 py-0 min-w-[16px] h-4 ml-auto">3</Badge>
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
