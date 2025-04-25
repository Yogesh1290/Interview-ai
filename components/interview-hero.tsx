import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function InterviewHero() {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary">
            AI-Powered Interview Practice
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Practice Like It's Real,
              <br />
              <span className="gradient-text">Get Feedback Like a Pro</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Elevate your interview skills with our AI-powered platform. Practice, refine, and excel.
            </p>
          </div>
          <div className="flex flex-col gap-3 min-[400px]:flex-row">
            <Button asChild size="lg" className="pulse-button group">
              <Link href="/interview/technical/full-stack">
                Start an Interview
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#interview-types">Explore Interview Types</Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 md:gap-8 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                  <path d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                  <path d="M20 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z"></path>
                  <path d="M4 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                  <path d="m16 8-2.2-2.2"></path>
                  <path d="m8 8-2.2-2.2"></path>
                  <path d="m16 16 2.2 2.2"></path>
                  <path d="m8 16 2.2 2.2"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">Advanced AI for realistic interviews</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  <path d="m14.5 9-5 5"></path>
                  <path d="m9.5 9 5 5"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Safe Practice</h3>
              <p className="text-sm text-muted-foreground">Risk-free environment to improve</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M2 12h10"></path>
                  <path d="M9 4v16"></path>
                  <path d="m3 9 3 3-3 3"></path>
                  <path d="M14 8h8"></path>
                  <path d="M18 4v16"></path>
                  <path d="m15 19 3-3-3-3"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Detailed Feedback</h3>
              <p className="text-sm text-muted-foreground">Actionable insights to improve</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
