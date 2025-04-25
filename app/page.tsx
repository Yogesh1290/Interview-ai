import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InterviewHero } from "@/components/interview-hero"
import { InterviewCard } from "@/components/interview-card"
import { PastInterviews } from "@/components/past-interviews"
import { Code, Users, Layers } from "lucide-react"

export const metadata: Metadata = {
  title: "InterviewPro - AI-Powered Interview Practice",
  description: "Practice interviews with AI and get professional feedback",
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              >
                <path d="M12 2v20"></path>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <span className="text-2xl font-bold gradient-text">InterviewPro</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/about">About</Link>
            </Button>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="default" asChild className="group">
              <Link href="/interview/technical/full-stack" className="flex items-center">
                Start Interview
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 transition-transform group-hover:translate-x-1"
                >
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="container flex-1 py-8">
        <InterviewHero />

        <Tabs defaultValue="technical" className="mt-16" id="interview-types">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Choose Your Interview Type</h2>
            <p className="text-muted-foreground text-center max-w-2xl mb-6">
              Select the interview type that matches your career goals and practice with our AI interviewer
            </p>
            <TabsList className="grid w-full max-w-md grid-cols-3 p-1 rounded-full">
              <TabsTrigger
                value="technical"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Code className="mr-2 h-4 w-4" />
                Technical
              </TabsTrigger>
              <TabsTrigger
                value="behavioral"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="mr-2 h-4 w-4" />
                Behavioral
              </TabsTrigger>
              <TabsTrigger
                value="mixed"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Layers className="mr-2 h-4 w-4" />
                Mixed
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="technical" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <InterviewCard
                title="Full Stack Developer"
                description="Practice technical questions for full stack development roles"
                type="technical"
                href="/interview/technical/full-stack"
              />
              <InterviewCard
                title="Frontend Developer"
                description="Focus on React, JavaScript, CSS and UI/UX questions"
                type="technical"
                href="/interview/technical/frontend"
              />
              <InterviewCard
                title="Backend Developer"
                description="Database design, API development, and system architecture"
                type="technical"
                href="/interview/technical/backend"
              />
            </div>
          </TabsContent>
          <TabsContent value="behavioral" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <InterviewCard
                title="Leadership Skills"
                description="Questions about team management and leadership experience"
                type="behavioral"
                href="/interview/behavioral/leadership"
              />
              <InterviewCard
                title="Problem Solving"
                description="Scenarios to demonstrate your problem-solving approach"
                type="behavioral"
                href="/interview/behavioral/problem-solving"
              />
              <InterviewCard
                title="Cultural Fit"
                description="Questions about working in teams and company culture"
                type="behavioral"
                href="/interview/behavioral/cultural-fit"
              />
            </div>
          </TabsContent>
          <TabsContent value="mixed" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <InterviewCard
                title="Senior Developer"
                description="Comprehensive interview for senior developer positions"
                type="mixed"
                href="/interview/mixed/senior-developer"
              />
              <InterviewCard
                title="Product Manager"
                description="Technical and behavioral questions for PM roles"
                type="mixed"
                href="/interview/mixed/product-manager"
              />
              <InterviewCard
                title="DevOps Engineer"
                description="Infrastructure, CI/CD, and team collaboration questions"
                type="mixed"
                href="/interview/mixed/devops"
              />
            </div>
          </TabsContent>
        </Tabs>

        <section className="mt-24">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Your Past Interviews</h2>
            <p className="text-muted-foreground text-center max-w-2xl">
              Review your previous interview sessions and track your progress over time
            </p>
          </div>
          <PastInterviews />
        </section>
      </div>

      <footer className="border-t py-12 mt-24 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-foreground"
                >
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <span className="text-2xl font-bold gradient-text">InterviewPro</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your go-to AI Interview Practice Platform. Practice, refine, and excel in your interviews.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Interview Types</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/interview/technical/full-stack"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Technical Interviews
                </Link>
              </li>
              <li>
                <Link
                  href="/interview/behavioral/leadership"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Behavioral Interviews
                </Link>
              </li>
              <li>
                <Link
                  href="/interview/mixed/senior-developer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Mixed Interviews
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Interview Tips
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-full mt-8 border-t pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs text-muted-foreground mb-4 sm:mb-0">
              &copy; {new Date().getFullYear()} InterviewPro. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
