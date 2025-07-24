import Link from "next/link"
import { Home, ListChecks, LogOut, User } from "lucide-react"
import { logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"

export function Header() {
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
        <ListChecks className="h-6 w-6" />
        <span className="sr-only">Election</span>
        <span>Election</span>
      </Link>
      <nav className="flex items-center gap-4 sm:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/elections"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ListChecks className="h-4 w-4" />
          Elections
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </nav>
    </header>
  )
}