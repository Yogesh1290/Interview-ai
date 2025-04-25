"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, ArrowLeft } from "lucide-react"
import { InterviewSession } from "@/components/interview-session"
import { formatInterviewType } from "@/lib/utils"

export default function InterviewPage() {
  const params = useParams()
  const router = useRouter()
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const type = params.type as string
  const role = params.role as string

  const formattedType = formatInterviewType(type)
  const formattedRole = role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const handleStartInterview = () => {
    setIsLoading(true)
    // Start immediately
    setIsStarted(true)
    setIsLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="container py-6">
        <Button variant="ghost" size="sm" className="mb-6" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {!isStarted ? (
          <div className="flex flex-col items-center justify-center py-12">
            <h1 className="text-3xl font-bold mb-2">{formattedRole} Interview</h1>
            <p className="text-muted-foreground mb-8">
              {formattedType} interview for {formattedRole} positions
            </p>

            <Card className="w-full max-w-2xl interview-card">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                    <Mic className="h-12 w-12 text-primary" />
                  </div>

                  <h2 className="text-2xl font-semibold mb-2">Ready to start your interview?</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    You'll be connected with an AI interviewer who will ask you questions related to {formattedRole}{" "}
                    positions. Speak clearly and take your time.
                  </p>

                  <Button
                    size="lg"
                    className={`pulse-button ${isLoading ? "opacity-80" : ""}`}
                    disabled={isLoading}
                    onClick={handleStartInterview}
                  >
                    {isLoading ? "Connecting..." : "🎤 Start Interview"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <InterviewSession type={type as string} role={role as string} />
        )}
      </div>
    </main>
  )
}
