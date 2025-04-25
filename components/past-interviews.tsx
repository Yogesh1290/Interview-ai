import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Star, Clock, ArrowUpRight } from "lucide-react"

// Mock data for past interviews
const pastInterviews = [
  {
    id: 1,
    title: "Full Stack Developer Interview",
    type: "technical",
    date: "Apr 8, 2025",
    score: 15,
    maxScore: 100,
    feedback: "The candidate demonstrated a significant lack of technical knowledge...",
    duration: "24 min",
  },
  {
    id: 2,
    title: "Graphic Designer Interview",
    type: "mixed",
    date: "Apr 9, 2025",
    score: 55,
    maxScore: 100,
    feedback: "The candidate demonstrates some potential but needs significant...",
    duration: "18 min",
  },
  {
    id: 3,
    title: "Mid Level Interview",
    type: "mixed",
    date: "Apr 7, 2025",
    score: 65,
    maxScore: 100,
    feedback: "The candidate demonstrates potential but needs to significantly improve...",
    duration: "32 min",
  },
  {
    id: 4,
    title: "Funding Development Interview",
    type: "technical",
    date: "Mar 31, 2025",
    score: 5,
    maxScore: 100,
    feedback: "The candidate's performance is extremely poor due to the lack of...",
    duration: "15 min",
  },
]

export function PastInterviews() {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    if (score >= 40) return "text-orange-500"
    return "text-red-500"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10"
    if (score >= 60) return "bg-yellow-500/10"
    if (score >= 40) return "bg-orange-500/10"
    return "bg-red-500/10"
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {pastInterviews.map((interview) => (
        <Card key={interview.id} className="interview-card group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <Badge
                variant="outline"
                className={`${
                  interview.type === "technical"
                    ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
                    : interview.type === "behavioral"
                      ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20"
                      : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20"
                }`}
              >
                {interview.type.charAt(0).toUpperCase() + interview.type.slice(1)}
              </Badge>
              <div className={`flex items-center justify-center px-2 py-1 rounded-full ${getScoreBg(interview.score)}`}>
                <Star className={`h-3.5 w-3.5 ${getScoreColor(interview.score)} mr-1`} fill="currentColor" />
                <span className={`text-xs font-medium ${getScoreColor(interview.score)}`}>
                  {interview.score}/{interview.maxScore}
                </span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{interview.title}</h3>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center">
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                {interview.date}
              </div>
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {interview.duration}
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">{interview.feedback}</p>
          </CardContent>
          <CardFooter className="p-6 pt-0">
            <Button asChild variant="ghost" className="w-full group-hover:bg-primary/10 transition-colors">
              <Link href={`/feedback/${interview.id}`} className="flex items-center justify-between w-full">
                <span>View Feedback</span>
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
