import Link from "next/link"
import { ArrowRight, UserCircle } from "lucide-react"

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-200 to-gray-300 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md mx-auto">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-primary/10 rounded-full mb-4">
            <UserCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Decorative Header */}
          <div className="h-2 bg-gradient-to-r from-primary to-primary/60"></div>

          <div className="p-8">
            {/* Main Content */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Get Started</h2>
                <p className="text-sm text-muted-foreground">Choose an option below to access your account</p>
              </div>

              {/* Auth Options */}
              <div className="space-y-4">
                <Link
                  className="w-full flex items-center justify-between px-5 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors group"
                  href="/login"
                >
                  <span className="font-medium">Login to your account</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  className="w-full flex items-center justify-between px-5 py-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors group"
                  href="/register"
                >
                  <span className="font-medium">Create a new account</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Additional Options */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="relative mt-12">
          <div className="absolute -top-6 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
          <div className="absolute -top-8 -right-8 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  )
}

