import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event, call_id, params, transcript } = body

    console.log(`Received webhook event: ${event} for call ${call_id}`)

    // Handle different event types
    switch (event) {
      case "call.created":
      case "call.started":
        return handleCallStarted(params)
      case "transcript.updated":
        return handleTranscriptUpdated(transcript, params)
      case "call.ended":
        return handleCallEnded(transcript, params)
      default:
        return NextResponse.json({ message: "Event not handled" }, { status: 200 })
    }
  } catch (error) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleCallStarted(params: any) {
  try {
    const { interviewType, role } = params || { interviewType: "technical", role: "developer" }

    // Generate initial prompt using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are a professional interviewer conducting a ${interviewType || "technical"} interview for a ${
      role ? role.replace("-", " ") : "developer"
    } position. Start by introducing yourself briefly and ask the first question. Be conversational but professional. Keep your response concise (2-3 sentences).`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log("Generated initial response:", response)
    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in handleCallStarted:", error)
    return NextResponse.json({
      response:
        "Hello! I'm your AI interviewer today. Let's start with a simple question: Could you tell me about your background and experience?",
    })
  }
}

async function handleTranscriptUpdated(transcript: any, params: any) {
  try {
    const { interviewType, role } = params || { interviewType: "technical", role: "developer" }

    // Get the last user message
    const lastUserMessage = transcript?.filter((t: any) => t.role === "user").pop()

    if (!lastUserMessage) {
      return NextResponse.json({
        response: "I didn't catch that. Could you please repeat?",
      })
    }

    // Generate next question based on conversation context
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Limit transcript to last 10 messages to avoid token limits
    const recentTranscript = transcript.slice(-10)

    const conversationContext = recentTranscript
      .map((t: any) => `${t.role === "assistant" ? "Interviewer" : "Candidate"}: ${t.content}`)
      .join("\n")

    const prompt = `You are a professional interviewer conducting a ${interviewType || "technical"} interview for a ${
      role ? role.replace("-", " ") : "developer"
    } position. 

Here's the conversation so far:
${conversationContext}

Based on the candidate's last response, ask a relevant follow-up question or move to a new topic if appropriate. Be conversational but professional. Keep your response concise (1-3 sentences).`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log("Generated follow-up response:", response)
    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in handleTranscriptUpdated:", error)
    return NextResponse.json({
      response:
        "That's interesting. Let me ask you another question: What do you consider your greatest professional strength?",
    })
  }
}

async function handleCallEnded(transcript: any, params: any) {
  try {
    const { interviewType, role } = params || { interviewType: "technical", role: "developer" }

    // Generate feedback using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Format the transcript for analysis
    const conversationText = transcript
      .map((t: any) => `${t.role === "assistant" ? "Interviewer" : "Candidate"}: ${t.content}`)
      .join("\n")

    const prompt = `You are an expert interviewer and career coach. You've just conducted a ${interviewType} interview for a ${role.replace("-", " ")} position.

Here's the full interview transcript:
${conversationText}

Please analyze the candidate's responses and provide:
1. An overall score from 0-100
2. A summary of their performance (2-3 paragraphs)
3. Detailed feedback in these categories:
   - Communication Skills (score 0-100 and 1-2 sentences of feedback)
   - Technical Knowledge (score 0-100 and 1-2 sentences of feedback)
   - Problem Solving (score 0-100 and 1-2 sentences of feedback)
   - Cultural Fit (score 0-100 and 1-2 sentences of feedback)
4. Areas of improvement (2-3 bullet points)

Format your response as JSON with the following structure:
{
  "overallScore": number,
  "summary": "string",
  "categories": [
    {
      "name": "string",
      "score": number,
      "feedback": "string"
    }
  ],
  "areasOfImprovement": ["string"]
}
`

    const result = await model.generateContent(prompt)
    const feedbackText = result.response.text()

    // Parse the JSON response
    let feedback
    try {
      feedback = JSON.parse(feedbackText)
    } catch (e) {
      console.error("Failed to parse feedback JSON:", e)
      feedback = {
        overallScore: 70,
        summary: "The candidate demonstrated good knowledge and communication skills.",
        categories: [
          {
            name: "Communication Skills",
            score: 75,
            feedback: "The candidate communicated clearly and effectively.",
          },
          {
            name: "Technical Knowledge",
            score: 70,
            feedback: "The candidate showed good understanding of technical concepts.",
          },
          {
            name: "Problem Solving",
            score: 65,
            feedback: "The candidate demonstrated adequate problem-solving skills.",
          },
          {
            name: "Cultural Fit",
            score: 80,
            feedback: "The candidate appears to align well with typical organizational values.",
          },
        ],
        areasOfImprovement: [
          "Could provide more specific examples in answers",
          "Should elaborate more on technical solutions",
        ],
      }
    }

    // Store the feedback in a database or cache for retrieval on the feedback page
    // For now, we'll just return it
    return NextResponse.json({ feedback })
  } catch (error) {
    console.error("Error in handleCallEnded:", error)
    return NextResponse.json({ message: "Failed to generate feedback" }, { status: 500 })
  }
}

export const maxDuration = 30 // 30 seconds max for the API route
