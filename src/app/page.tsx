import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Shield, BarChart3, Users } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Secure Voting Made Simple</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform provides all the tools you need to create, manage, and analyze votes with confidence.
            </p>
          </div>
        </div>

        {/* Body Section - Grid of Features */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Ballots</h3>
            <p className="text-muted-foreground">
              End-to-end encryption ensures your votes remain private and tamper-proof, maintaining the integrity of
              every election.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Multiple Voting Methods</h3>
            <p className="text-muted-foreground">
              Support for various voting types including single choice, multiple choice, ranked choice, and weighted
              voting.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Real-time Results</h3>
            <p className="text-muted-foreground">
              Watch results update in real-time as votes come in with beautiful visualizations and detailed analytics.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Easy Setup</h3>
            <p className="text-muted-foreground">
              Create and launch your poll in minutes with our intuitive interface. No technical expertise required.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Fraud Prevention</h3>
            <p className="text-muted-foreground">
              Advanced security measures prevent duplicate voting and ensure only authorized participants can cast
              ballots.
            </p>
          </div>

          <div className="flex flex-col items-start space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h10" />
                <path d="M7 12h10" />
                <path d="M7 17h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold">Customizable Forms</h3>
            <p className="text-muted-foreground">
              Design your ballot with custom questions, images, and branding to match your organization's identity.
            </p>
          </div>
        </div>

        {/* Section Footer with Two Large Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button size="lg" className="px-8 py-6 text-base" asChild>
            <Link href="/create-poll">Create Your First Poll</Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-6 text-base" asChild>
            <Link href="/learn-more">Explore All Features</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

