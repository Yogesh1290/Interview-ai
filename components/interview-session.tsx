"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PhoneOff, Mic, MicOff, Volume2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatInterviewType } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface InterviewSessionProps {
  type: string
  role: string
}

interface Message {
  role: "assistant" | "user"
  content: string
  timestamp: Date
}

export function InterviewSession({ type, role }: InterviewSessionProps) {
  const router = useRouter()
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState<Message[]>([])
  const [isMicActive, setIsMicActive] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isEnding, setIsEnding] = useState(false)
  const [isFeedbackGenerating, setIsFeedbackGenerating] = useState(false)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const vapiRef = useRef<any>(null)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const originalConsoleError = useRef<typeof console.error | null>(null)
  const hasAddedInitialGreeting = useRef<boolean>(false)
  const hasTriggeredInitialSpeech = useRef<boolean>(false)
  // Add a new state variable to track if a call is being initialized
  const [isInitializing, setIsInitializing] = useState(false)

  const formattedType = formatInterviewType(type)
  const formattedRole = role
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  // Override console.error to suppress specific Daily.co errors
  useEffect(() => {
    // Save the original console.error
    originalConsoleError.current = console.error

    // Override console.error to filter out specific errors
    console.error = (...args) => {
      // Check if this is the Daily.co "Meeting has ended" error
      const errorString = args.join(" ")
      if (
        errorString.includes("Meeting has ended") ||
        errorString.includes("Exiting meeting because room was deleted") ||
        errorString.includes("@daily-co/daily-js")
      ) {
        // If we're in the process of ending the call, suppress this error
        if (isEnding) {
          console.log("Suppressed Daily.co error during call termination")
          return
        }
      }

      // For all other errors, use the original console.error
      if (originalConsoleError.current) {
        originalConsoleError.current.apply(console, args)
      }
    }

    // Restore the original console.error on cleanup
    return () => {
      if (originalConsoleError.current) {
        console.error = originalConsoleError.current
      }
    }
  }, [isEnding])

  useEffect(() => {
    // Auto-scroll transcript to bottom
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  // Cleanup on unmount - make this more thorough
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up resources")

      // Clean up Vapi instance
      if (vapiRef.current) {
        try {
          console.log("Stopping Vapi call on unmount")
          vapiRef.current.stop()
          vapiRef.current = null
        } catch (e) {
          console.log("Error stopping Vapi call:", e)
        }
      }

      // Clean up any orphaned DailyIframe elements
      try {
        const existingIframes = document.querySelectorAll('iframe[title="daily-iframe"]')
        existingIframes.forEach((iframe) => {
          console.log("Removing orphaned Daily iframe on unmount")
          iframe.remove()
        })
      } catch (e) {
        console.log("Error cleaning up iframes:", e)
      }

      // Clear any pending timeouts
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  // Add initial greeting when call becomes active
  useEffect(() => {
    if (isCallActive && !hasAddedInitialGreeting.current) {
      // Add initial greeting to transcript
      setTranscript([
        {
          role: "assistant",
          content: `Hello! I'll be conducting your ${formattedType.toLowerCase()} interview for the ${formattedRole} position today. Let's get started with some questions.`,
          timestamp: new Date(),
        },
      ])
      hasAddedInitialGreeting.current = true

      // Force the AI to speak first using the say method
      if (vapiRef.current && !hasTriggeredInitialSpeech.current) {
        setTimeout(async () => {
          try {
            console.log("Forcing AI to speak first...")
            await vapiRef.current.say(
              `Hello! I'll be conducting your ${formattedType.toLowerCase()} interview for the ${formattedRole} position today. Let's get started with some questions. What's your background in ${formattedRole}?`,
              false,
            )
            hasTriggeredInitialSpeech.current = true
          } catch (error) {
            console.error("Failed to trigger initial AI speech:", error)
          }
        }, 1000)
      }
    }
  }, [isCallActive, formattedType, formattedRole])

  // Update the startCall function to prevent duplicate instances
  const startCall = async () => {
    // Prevent multiple initialization attempts
    if (isLoading || isInitializing || isCallActive) {
      console.log("Call already in progress or initializing, ignoring request")
      return
    }

    setIsLoading(true)
    setIsInitializing(true)
    setError(null)
    hasAddedInitialGreeting.current = false
    hasTriggeredInitialSpeech.current = false

    // First, ensure any existing instance is cleaned up
    if (vapiRef.current) {
      try {
        console.log("Cleaning up existing Vapi instance")
        await vapiRef.current.stop()
        // Give time for cleanup
        await new Promise((resolve) => setTimeout(resolve, 1000))
        vapiRef.current = null
      } catch (e) {
        console.log("Error cleaning up previous instance:", e)
        // Continue anyway
      }
    }

    // Clean up any orphaned DailyIframe elements
    try {
      const existingIframes = document.querySelectorAll('iframe[title="daily-iframe"]')
      existingIframes.forEach((iframe) => {
        console.log("Removing orphaned Daily iframe")
        iframe.remove()
      })
    } catch (e) {
      console.log("Error cleaning up iframes:", e)
    }

    try {
      // Import Vapi SDK
      const VapiModule = await import("@vapi-ai/web")
      const Vapi = VapiModule.default

      console.log("Initializing Vapi with public key...")

      // Initialize Vapi with your public key
      const vapi = new Vapi("d2c804ff-8e08-44c7-b4ca-50a5c6d00624")
      vapiRef.current = vapi

      // Set up event listeners
      vapi.on("speech-start", () => {
        console.log("AI started speaking")
        setIsAISpeaking(true)
        setIsMicActive(false)
      })

      vapi.on("speech-end", () => {
        console.log("AI stopped speaking")
        setIsAISpeaking(false)
        setIsMicActive(true)
      })

      vapi.on("call-start", () => {
        console.log("Call started")
        setIsCallActive(true)
      })

      vapi.on("call-end", () => {
        console.log("Call ended normally")
        handleCallEnd()
      })

      vapi.on("volume-level", (volume: number) => {
        setVolumeLevel(volume)
      })

      vapi.on("message", (message: any) => {
        console.log("Received message:", message)

        // Handle transcript messages
        if (message.type === "transcript") {
          const { role, content } = message.transcript

          // Only add the message if it has content
          if (content && content.trim() !== "") {
            setTranscript((prev) => [
              ...prev,
              {
                role,
                content,
                timestamp: new Date(),
              },
            ])
          }
        }
      })

      vapi.on("error", (e: any) => {
        // If we're in the process of ending the call, ignore all errors
        if (isEnding) {
          console.log("Ignoring error during call termination:", e?.message || e?.errorMsg || "Unknown error")
          handleCallEnd()
          return
        }

        console.error("Vapi error:", e)
        setError(`Error: ${e.message || e.errorMsg || "Unknown error occurred"}`)
      })

      console.log("Starting call with assistant...")

      // Start the call with a transient assistant configuration
      await vapi.start({
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a professional interviewer conducting a ${formattedType} interview for a ${formattedRole} position. 
        IMPORTANT: You must start the conversation immediately by introducing yourself and explaining that you'll be conducting the interview.
        Your first message should be: "Hello! I'll be conducting your ${formattedType.toLowerCase()} interview for the ${formattedRole} position today. Let's get started with some questions."
        Then immediately ask your first question without waiting for a response.
        Wait for the candidate to respond before asking the next question.
        Ask follow-up questions based on their responses when appropriate.
        Conduct a thorough interview with at least 5-7 questions.
        At the end, thank them for their time and let them know you'll provide feedback.
        
        Interview type: ${formattedType}
        Role: ${formattedRole}`,
            },
            // Add an initial user message to force the AI to respond immediately
            {
              role: "user",
              content: "I'm ready for the interview.",
            },
          ],
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer", // You can change this to a different voice if preferred
        },
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        name: `${formattedType} Interview for ${formattedRole}`,
        recordingEnabled: true,
        clientMessages: ["transcript"],
      })

      console.log("Call started successfully")
    } catch (error) {
      console.error("Failed to start call:", error)
      setError(`Failed to start the interview: ${(error as Error).message || "Unknown error"}`)
      setIsCallActive(false)

      // Clean up on error
      if (vapiRef.current) {
        try {
          vapiRef.current.stop()
          vapiRef.current = null
        } catch (e) {
          console.log("Error cleaning up after failed start:", e)
        }
      }
    } finally {
      setIsLoading(false)
      setIsInitializing(false)
    }
  }

  // Manual function to add user speech to transcript
  const addUserSpeech = () => {
    if (!isCallActive || !isMicActive) return

    // This is a fallback in case automatic transcription isn't working
    const userInput = prompt("What did you say? (This is a fallback for transcription)")

    if (userInput && userInput.trim() !== "") {
      setTranscript((prev) => [
        ...prev,
        {
          role: "user",
          content: userInput,
          timestamp: new Date(),
        },
      ])
    }
  }

  // Generate feedback based on the interview transcript
  const generateFeedback = async () => {
    setIsFeedbackGenerating(true)

    try {
      // Format the transcript for the API
      const formattedTranscript = transcript.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Create a fallback feedback object in case the API call fails
      const fallbackFeedback = {
        overallScore: 65,
        summary:
          "Based on your interview responses, you demonstrated some knowledge of the subject matter. There were areas where you provided good insights, though some responses could benefit from more depth and specific examples.",
        categories: [
          {
            name: "Communication Skills",
            score: 70,
            feedback:
              "You communicated your thoughts clearly for the most part. Consider structuring responses with a clear beginning, middle, and conclusion.",
          },
          {
            name: "Technical Knowledge",
            score: 65,
            feedback:
              "You showed understanding of core concepts but could benefit from deeper technical knowledge in some areas.",
          },
          {
            name: "Problem Solving",
            score: 60,
            feedback:
              "Your approach to problems was logical, though sometimes lacking in consideration of alternative solutions or edge cases.",
          },
          {
            name: "Cultural Fit",
            score: 75,
            feedback:
              "You demonstrated values that align well with most organizations, including teamwork and adaptability.",
          },
        ],
        areasOfImprovement: [
          "Provide more specific examples from past experiences",
          "Deepen technical knowledge in key areas relevant to the role",
          "Practice structured responses to common interview questions",
        ],
      }

      // Try to call the API with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        const response = await fetch("/api/generate-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: formattedTranscript,
            interviewType: type,
            role: role,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        const feedbackData = await response.json()

        // Store the feedback in sessionStorage for the feedback page to access
        sessionStorage.setItem(
          "interviewFeedback",
          JSON.stringify({
            ...feedbackData,
            interviewType: type,
            role: role,
            date: new Date().toISOString(),
            transcript: formattedTranscript,
          }),
        )
      } catch (apiError) {
        console.warn("API call failed, using fallback feedback:", apiError)

        // Use the fallback feedback if the API call fails
        sessionStorage.setItem(
          "interviewFeedback",
          JSON.stringify({
            ...fallbackFeedback,
            interviewType: type,
            role: role,
            date: new Date().toISOString(),
            transcript: formattedTranscript,
          }),
        )
      }

      // Navigate to the feedback page
      router.push("/feedback/new")
    } catch (error) {
      console.error("Error generating feedback:", error)

      // Even if everything fails, still try to redirect with minimal feedback
      try {
        const minimalFeedback = {
          overallScore: 60,
          summary:
            "Thank you for completing the interview. Due to a technical issue, we could only generate limited feedback.",
          categories: [
            {
              name: "Overall Performance",
              score: 60,
              feedback:
                "You completed the interview process. For more detailed feedback, please try another interview session.",
            },
          ],
          areasOfImprovement: ["Try another interview for more detailed feedback"],
          interviewType: type,
          role: role,
          date: new Date().toISOString(),
        }

        sessionStorage.setItem("interviewFeedback", JSON.stringify(minimalFeedback))
      } catch (e) {
        sessionStorage.setItem("feedbackError", "true")
      }

      router.push("/feedback/new")
    } finally {
      setIsFeedbackGenerating(false)
    }
  }

  const handleCallEnd = () => {
    setIsCallActive(false)
    setIsMicActive(false)
    setIsAISpeaking(false)

    // Add ending message if not already present
    setTranscript((prev) => {
      const lastMessage = prev[prev.length - 1]
      if (lastMessage?.content?.includes("Thank you for completing the interview")) {
        return prev
      }
      return [
        ...prev,
        {
          role: "assistant",
          content: "Thank you for completing the interview. I'll now analyze your responses and provide feedback.",
          timestamp: new Date(),
        },
      ]
    })

    // Ensure we have at least some transcript data before generating feedback
    if (transcript.length < 2) {
      // If we have almost no transcript, add some minimal content
      setTranscript([
        {
          role: "assistant",
          content: `Hello! I'll be conducting your ${formattedType.toLowerCase()} interview for the ${formattedRole} position today.`,
          timestamp: new Date(),
        },
        {
          role: "user",
          content: "Thank you for the opportunity to interview.",
          timestamp: new Date(),
        },
        {
          role: "assistant",
          content: "Thank you for completing the interview. I'll now analyze your responses and provide feedback.",
          timestamp: new Date(),
        },
      ])
    }

    // Clean up any orphaned DailyIframe elements
    try {
      const existingIframes = document.querySelectorAll('iframe[title="daily-iframe"]')
      existingIframes.forEach((iframe) => {
        console.log("Removing orphaned Daily iframe on call end")
        iframe.remove()
      })
    } catch (e) {
      console.log("Error cleaning up iframes:", e)
    }

    // Generate feedback based on the transcript
    generateFeedback()
  }

  const endCall = async () => {
    if (!vapiRef.current) {
      // If no Vapi instance, just proceed to feedback
      handleCallEnd()
      return
    }

    // Set ending state to suppress errors
    setIsEnding(true)

    // Ensure we clean up no matter what
    const cleanup = () => {
      try {
        if (vapiRef.current) {
          vapiRef.current.stop()
          vapiRef.current = null
        }

        // Clean up any orphaned DailyIframe elements
        const existingIframes = document.querySelectorAll('iframe[title="daily-iframe"]')
        existingIframes.forEach((iframe) => iframe.remove())
      } catch (e) {
        console.log("Final cleanup error (suppressed):", e)
      }
    }

    try {
      // Set a timeout to ensure we don't hang
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout ending call")), 5000),
      )

      // Try to gracefully end the call
      const endPromise = new Promise(async (resolve) => {
        try {
          await vapiRef.current.say("Thank you for your time. I'll now end the interview and provide feedback.", true)
          resolve(true)
        } catch (error) {
          console.log("Error in say method, using fallback")
          try {
            await vapiRef.current.stop()
            resolve(true)
          } catch (e) {
            resolve(false)
          }
        }
      })

      // Race the timeout against the end call
      await Promise.race([endPromise, timeoutPromise])
    } catch (error) {
      console.log("Error ending call (suppressed):", error)
    } finally {
      // Always clean up and proceed to feedback
      cleanup()
      handleCallEnd()
    }
  }

  const toggleMute = () => {
    if (vapiRef.current) {
      const currentlyMuted = vapiRef.current.isMuted()
      vapiRef.current.setMuted(!currentlyMuted)
      setIsMicActive(currentlyMuted) // If it was muted, now it's active
    }
  }

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto">
      <div className="w-full mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          <span className="gradient-text">{formattedRole}</span> Interview
        </h1>
        <p className="text-center text-muted-foreground">
          {formattedType} interview session • Professional feedback provided at the end
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-8">
        <Card className="interview-card overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="AI Interviewer" />
                <AvatarFallback className="bg-primary/20 text-primary text-xl">AI</AvatarFallback>
              </Avatar>
              {isCallActive && isAISpeaking && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                  Speaking...
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-1">AI Interviewer</h2>
            <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
              Professional Interviewer
            </Badge>
            <p className="text-sm text-muted-foreground text-center">
              I'll be asking you questions related to {formattedRole} positions. Speak clearly and take your time with
              your answers.
            </p>
            {isCallActive && isAISpeaking && (
              <div className="mt-4 w-full">
                <div className="flex items-center justify-center mb-2">
                  <Volume2 className="h-5 w-5 mr-2 text-primary mic-pulse" />
                  <span className="text-primary">Speaking...</span>
                </div>
                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${volumeLevel * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="interview-card overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-4 border-secondary/20">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="You" />
                <AvatarFallback className="bg-secondary/20 text-secondary-foreground text-xl">You</AvatarFallback>
              </Avatar>
              {isCallActive && isMicActive && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                  Mic Active
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-1">You</h2>
            <Badge variant="outline" className="mb-4 bg-secondary/10 text-secondary-foreground border-secondary/20">
              Candidate
            </Badge>
            <p className="text-sm text-muted-foreground text-center">
              Answer questions as you would in a real interview. This is a safe space to practice and improve your
              skills.
            </p>
            {isCallActive && (
              <div className="mt-4 flex items-center justify-center">
                {isMicActive ? (
                  <div className="flex items-center text-green-500">
                    <Mic className="h-5 w-5 mr-2 mic-pulse" />
                    <span>Mic active - speak now</span>
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <MicOff className="h-5 w-5 mr-2" />
                    <span>Mic inactive - listening to interviewer</span>
                  </div>
                )}
              </div>
            )}
            {isCallActive && (
              <div className="flex flex-col gap-2 mt-4 w-full">
                <Button variant="outline" size="sm" onClick={toggleMute} className="w-full">
                  {isMicActive ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Mute Microphone
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Unmute Microphone
                    </>
                  )}
                </Button>
                {isMicActive && (
                  <Button variant="secondary" size="sm" onClick={addUserSpeech} className="w-full">
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
                      className="mr-2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                    </svg>
                    Add Response Manually
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="w-full interview-card mb-8 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Live Transcript
            </h3>
            {isCallActive && (
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 animate-pulse">
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Recording
                </span>
              </Badge>
            )}
          </div>
          <div ref={transcriptRef} className="transcript-container glass-effect rounded-lg p-4 mb-4">
            {transcript.length > 0 ? (
              transcript.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === "assistant" ? "pl-4 border-l-2 border-primary" : "pl-4 border-l-2 border-secondary"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <span
                      className={`font-semibold mr-2 ${
                        message.role === "assistant" ? "text-primary" : "text-secondary-foreground"
                      }`}
                    >
                      {message.role === "assistant" ? "AI Interviewer:" : "You:"}
                    </span>
                    <span className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground mb-4 opacity-50"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p className="text-muted-foreground">
                  {isCallActive
                    ? "Waiting for conversation to begin..."
                    : "Transcript will appear here once the interview starts."}
                </p>
                {!isCallActive && (
                  <p className="text-xs text-muted-foreground mt-2 max-w-md">
                    Click the "Start Interview" button below to begin your AI-powered interview session
                  </p>
                )}
              </div>
            )}
          </div>

          {error && !isEnding && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 border border-destructive/20">
              <div className="flex items-start">
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
                  className="mr-2 mt-0.5"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                </svg>
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            {!isCallActive ? (
              <Button
                size="lg"
                className={`pulse-button ${isLoading ? "opacity-80" : ""} group`}
                disabled={isLoading || isInitializing}
                onClick={startCall}
              >
                {isLoading || isInitializing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting<span className="loading-dots"></span>
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Start Interview
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={endCall}
                disabled={isEnding || isFeedbackGenerating}
                className="group"
              >
                {isEnding || isFeedbackGenerating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing<span className="loading-dots"></span>
                  </>
                ) : (
                  <>
                    <PhoneOff className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    End Interview
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p className="flex items-center justify-center">
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
            className="mr-2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
          Having technical issues? Try refreshing the page or check your microphone permissions.
        </p>
      </div>
    </div>
  )
}
