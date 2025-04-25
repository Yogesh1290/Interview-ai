"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Star, Badge } from "lucide-react"

// Mock data for feedback
const feedbackData = {
  new: {
    title: "Full Stack Developer Interview",
    type: "technical",
    date: "Apr 10, 2025 8:37 AM",
    score: 72,
    maxScore: 100,
    summary:
      "The candidate demonstrates good technical knowledge and problem-solving skills. Their communication is clear and they show potential for growth. Some areas for improvement include system design knowledge and handling edge cases in coding problems.",
    categories: [
      {
        name: "Communication Skills",
        score: 80,
        feedback:
          "The candidate communicates clearly and effectively. They articulate their thoughts well and explain technical concepts in an understandable manner.",
      },
      {
        name: "Technical Knowledge",
        score: 75,
        feedback:
          "The candidate demonstrates solid understanding of frontend and backend technologies. They are familiar with React, Node.js, and database concepts.",
      },
      {
        name: "Problem Solving",
        score: 70,
        feedback:
          "The candidate approaches problems methodically and considers different solutions. They could improve on optimizing their solutions and considering edge cases.",
      },
      {
        name: "System Design",
        score: 65,
        feedback:
          "The candidate has basic understanding of system design principles but could benefit from more experience with scalable architectures.",
      },
    ],
  },
  "1": {
    title: "Full Stack Developer Interview",
    type: "technical",
    date: "Apr 8, 2025 8:37 AM",
    score: 15,
    maxScore: 100,
    summary:
      "The candidate demonstrated a significant lack of technical knowledge and problem-solving skills. Their communication was unclear and they struggled to articulate basic concepts. Significant improvement is needed across all areas.",
    categories: [
      {
        name: "Communication Skills",
        score: 20,
        feedback:
          "The candidate's communication was often unclear and disorganized. They struggled to articulate their thoughts and explain technical concepts.",
      },
      {
        name: "Technical Knowledge",
        score: 15,
        feedback:
          "The candidate showed significant gaps in understanding of fundamental web development concepts and technologies.",
      },
      {
        name: "Problem Solving",
        score: 10,
        feedback:
          "The candidate struggled to approach problems methodically and often jumped to incorrect solutions without proper analysis.",
      },
      {
        name: "System Design",
        score: 15,
        feedback: "The candidate lacks understanding of basic system design principles and architecture concepts.",
      },
    ],
  },
  "2": {
    title: "Graphic Designer Interview",
    type: "mixed",
    date: "Apr 9, 2025 8:37 AM",
    score: 55,
    maxScore: 100,
    summary:
      "The candidate demonstrates some potential but needs significant improvement in communication, technical knowledge, and problem-solving skills. Their lack of clarity and confidence raises concerns about their ability to perform effectively in the role. Further development and training are necessary for them to be successful.",
    categories: [
      {
        name: "Communication Skills",
        score: 50,
        feedback:
          "The candidate's communication was often unclear and they struggled to articulate design decisions confidently.",
      },
      {
        name: "Technical Knowledge",
        score: 65,
        feedback:
          "The candidate demonstrated some basic understanding of design principles and tools but lacked depth in certain areas.",
      },
      {
        name: "Portfolio Quality",
        score: 60,
        feedback: "The portfolio shows some creativity but lacks consistency and professional polish.",
      },
      {
        name: "Problem Solving",
        score: 45,
        feedback: "The candidate struggled to approach design problems methodically and often missed key requirements.",
      },
    ],
  },
}

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  // Get feedback data or redirect if not found
  const feedback = feedbackData[id as keyof typeof feedbackData]
  if (!feedback) {
    router.push("/")
    return null
  }

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

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Fair"
    return "Needs Improvement"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10 text-green-500 border-green-500/20"
    if (score >= 60) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    if (score >= 40) return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    return "bg-red-500/10 text-red-500 border-red-500/20"
  }

  // Update the return statement with more modern UI
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container py-6">
        <Button variant="ghost" size="sm" className="mb-6 group" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{feedback.title} Feedback</h1>
            <p className="text-muted-foreground">Detailed analysis of your interview performance</p>
          </div>

          <Card className="interview-card mb-8 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-border/40">
                <div>
                  <div className="flex items-center mb-2">
                    <Badge variant="outline" className={getScoreBadgeColor(feedback.score)}>
                      {getScoreBadge(feedback.score)}
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-3">{feedback.date}</span>
                  </div>
                  <h2 className="text-2xl font-semibold">Overall Performance</h2>
                </div>
                <div className="flex items-center mt-4 md:mt-0 score-reveal">
                  <div className={`text-4xl font-bold ${getScoreColor(feedback.score)} mr-3`}>{feedback.score}</div>
                  <div className="flex flex-col items-start">
                    <div className="text-xs text-muted-foreground">Score</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(feedback.score / 20) ? getScoreColor(feedback.score) : "text-muted"}`}
                          fill={star <= Math.round(feedback.score / 20) ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Summary</h3>
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
                  <path d="M2 12h10"></path>
                  <path d="M9 4v16"></path>
                  <path d="m3 9 3 3-3 3"></path>
                  <path d="M14 8h8"></path>
                  <path d="M18 4v16"></path>
                  <path d="m15 19 3-3-3-3"></path>
                </svg>
                Performance Breakdown
              </h3>

              <div className="space-y-8">
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
            <Button variant="outline" onClick={() => router.push("/interview/technical/full-stack")} className="group">
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
