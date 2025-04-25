"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Star, Badge } from "lucide-react"

interface FeedbackCategory {
  name: string
  score: number
  feedback: string
}

interface FeedbackData {
  overallScore: number
  summary: string
  categories: FeedbackCategory[]
  areasOfImprovement: string[]
  interviewType?: string
  role?: string
  date?: string
  transcript?: any[]
}

export default function NewFeedbackPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get feedback data from sessionStorage
    try {
      const storedFeedback = sessionStorage.getItem("interviewFeedback")
      const feedbackError = sessionStorage.getItem("feedbackError")

      if (feedbackError === "true") {
        setError("There was an issue generating detailed feedback. Showing a general assessment instead.")
        sessionStorage.removeItem("feedbackError")
      }

      if (storedFeedback) {
        try {
          const parsedFeedback = JSON.parse(storedFeedback)
          setFeedback(parsedFeedback)
          setIsLoading(false)

          // Clear the feedback from session storage to prevent showing old feedback
          // on future visits, but keep a backup copy
          sessionStorage.setItem("lastInterviewFeedback", storedFeedback)
          sessionStorage.removeItem("interviewFeedback")
          return
        } catch (parseError) {
          console.error("Error parsing feedback:", parseError)
          // Continue to fallback
        }
      }

      // Try to get the last feedback as a fallback
      const lastFeedback = sessionStorage.getItem("lastInterviewFeedback")
      if (lastFeedback) {
        try {
          const parsedLastFeedback = JSON.parse(lastFeedback)
          setFeedback(parsedLastFeedback)
          setError("Could not retrieve your most recent feedback. Showing your previous interview feedback instead.")
          setIsLoading(false)
          return
        } catch (parseError) {
          console.error("Error parsing last feedback:", parseError)
          // Continue to fallback
        }
      }

      // If no feedback in storage, check if we're in development mode or provide a generic fallback
      setTimeout(() => {
        setFeedback({
          overallScore: 60,
          summary:
            "We couldn't retrieve specific feedback for your interview. This could be due to a technical issue or because you accessed this page directly without completing an interview.",
          categories: [
            {
              name: "Communication Skills",
              score: 60,
              feedback:
                "We couldn't analyze your communication skills specifically. Try completing another interview for personalized feedback.",
            },
            {
              name: "Technical Knowledge",
              score: 60,
              feedback:
                "We couldn't analyze your technical knowledge specifically. Try completing another interview for personalized feedback.",
            },
            {
              name: "Problem Solving",
              score: 60,
              feedback:
                "We couldn't analyze your problem-solving skills specifically. Try completing another interview for personalized feedback.",
            },
            {
              name: "Cultural Fit",
              score: 60,
              feedback:
                "We couldn't analyze your cultural fit specifically. Try completing another interview for personalized feedback.",
            },
          ],
          areasOfImprovement: [
            "Complete a full interview to get personalized feedback",
            "Ensure your microphone is working properly during interviews",
            "Try a different interview type if you encountered technical issues",
          ],
          interviewType: "General",
          role: "Interview",
          date: new Date().toISOString(),
        })
        setIsLoading(false)
        setError("Could not retrieve interview feedback. Showing generic feedback instead.")
      }, 1500)
    } catch (e) {
      console.error("Error retrieving feedback:", e)
      setError("An error occurred while retrieving feedback data.")
      setIsLoading(false)

      // Provide a minimal fallback
      setFeedback({
        overallScore: 50,
        summary: "An error occurred while retrieving your feedback. Please try completing another interview.",
        categories: [
          {
            name: "Overall Performance",
            score: 50,
            feedback: "We couldn't analyze your performance due to a technical issue.",
          },
        ],
        areasOfImprovement: ["Try completing another interview for personalized feedback"],
        interviewType: "Technical",
        role: "Interview",
        date: new Date().toISOString(),
      })
    }
  }, [router])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    if (score >= 40) return "bg-orange-500"
    return "bg-red-500"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString()
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="container py-6">
          <Button variant="ghost" size="sm" className="mb-6 group" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>

          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="inline-flex items-center justify-center p-4 mb-6 rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">
              Analyzing Your Interview<span className="loading-dots"></span>
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Our AI is reviewing your responses and preparing detailed feedback. This will only take a moment.
            </p>
            <div className="w-full max-w-md mx-auto">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-2/3 animate-pulse"></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Analyzing responses</span>
                <span>Generating insights</span>
                <span>Finalizing</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="container py-6">
          <Button variant="ghost" size="sm" className="mb-6 group" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>

          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="inline-flex items-center justify-center p-4 mb-6 rounded-full bg-destructive/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-destructive"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                <path d="M12 9v4"></path>
                <path d="M12 17h.01"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Feedback Issue</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error}</p>
            <Button onClick={() => router.push("/")} className="group">
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
                className="mr-2 transition-transform group-hover:-translate-x-1"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Return to Home
            </Button>
          </div>
        </div>
      </main>
    )
  }

  if (!feedback) {
    return (
      <main className="flex min-h-screen flex-col">
        <div className="container py-6">
          <Button variant="ghost" size="sm" className="mb-6 group" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Button>

          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="inline-flex items-center justify-center p-4 mb-6 rounded-full bg-muted">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground"
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"></path>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Feedback Not Available</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              We couldn't retrieve your interview feedback. Please try again later or start a new interview session.
            </p>
            <Button onClick={() => router.push("/")} className="group">
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
                className="mr-2 transition-transform group-hover:-translate-x-1"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Return to Home
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container py-6">
        <Button variant="ghost" size="sm" className="mb-6 group" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">{feedback.interviewType || "Interview"} Feedback:</span>{" "}
              {feedback.role?.replace(/-/g, " ") || "Position"}
            </h1>
            <p className="text-muted-foreground">Detailed analysis of your interview performance</p>
          </div>

          <Card className="interview-card mb-8 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-border/40">
                <div>
                  <div className="flex items-center mb-2">
                    <Badge
                      variant="outline"
                      className={`${
                        feedback.overallScore >= 80
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : feedback.overallScore >= 60
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : feedback.overallScore >= 40
                              ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      {feedback.overallScore >= 80
                        ? "Excellent"
                        : feedback.overallScore >= 60
                          ? "Good"
                          : feedback.overallScore >= 40
                            ? "Fair"
                            : "Needs Improvement"}
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-3">{formatDate(feedback.date)}</span>
                  </div>
                  <h2 className="text-2xl font-semibold">Overall Performance</h2>
                </div>
                <div className="flex items-center mt-4 md:mt-0 score-reveal">
                  <div className={`text-4xl font-bold ${getScoreColor(feedback.overallScore)} mr-3`}>
                    {feedback.overallScore}
                  </div>
                  <div className="flex flex-col items-start">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(feedback.overallScore / 20) ? getScoreColor(feedback.overallScore) : "text-muted"}`}
                          fill={star <= Math.round(feedback.overallScore / 20) ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
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
                    className="mr-2 text-primary"
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"></path>
                    <path d="M9 9h1"></path>
                    <path d="M9 13h6"></path>
                    <path d="M9 17h6"></path>
                  </svg>
                  Summary
                </h3>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <p>{feedback.summary}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 flex items-center">
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
                  className="mr-2 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  <path d="M12 8v4"></path>
                  <path d="M12 16h.01"></path>
                </svg>
                Performance Breakdown
              </h3>

              <div className="space-y-6">
                {feedback.categories.map((category, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-background/50 border border-border/40 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-lg">{category.name}</h4>
                      <div className="flex items-center">
                        <span className={`font-semibold ${getScoreColor(category.score)} text-lg`}>
                          {category.score}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">/100</span>
                      </div>
                    </div>
                    <div className="relative h-2 w-full bg-muted rounded-full mb-3 overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(category.score)}`}
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">{category.feedback}</p>
                  </div>
                ))}
              </div>

              {feedback.areasOfImprovement && feedback.areasOfImprovement.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
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
                      className="mr-2 text-primary"
                    >
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                    </svg>
                    Areas for Improvement
                  </h3>
                  <div className="p-4 rounded-lg bg-background/50 border border-border/40">
                    <ul className="space-y-2 pl-5 list-disc">
                      {feedback.areasOfImprovement.map((area, index) => (
                        <li key={index} className="text-muted-foreground">
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/")} className="group">
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
                className="mr-2 transition-transform group-hover:-translate-x-1"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Return to Home
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/interview/${feedback.interviewType?.toLowerCase() || "technical"}/${feedback.role || "full-stack"}`,
                )
              }
              className="group"
            >
              Try Another Interview
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
                <path d="M12 22v-4"></path>
                <path d="M17 14 12 9 7 14"></path>
                <path d="M12 22V9"></path>
                <path d="M20 2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"></path>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
