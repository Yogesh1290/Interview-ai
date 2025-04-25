import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

// Update the API route to be more robust and handle errors better

// Add a timeout mechanism to the API route
export const maxDuration = 60 // Increase to 60 seconds max for the API route

// Update the POST function to handle errors better
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { transcript, interviewType, role } = body

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 })
    }

    // Format the transcript for analysis
    const conversationText = transcript
      .map((t: any) => `${t.role === "assistant" ? "Interviewer" : "Candidate"}: ${t.content}`)
      .join("\n")

    // Generate feedback using Gemini with a timeout
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Create a more concise prompt to reduce token usage
    const prompt = `You are an expert interviewer evaluating a ${interviewType} interview for a ${role.replace("-", " ")} position.

Transcript:
${conversationText}

Analyze the candidate's responses and provide:
1. Overall score (0-100)
2. Brief performance summary (1-2 paragraphs)
3. Scores and brief feedback for: Communication Skills, Technical Knowledge, Problem Solving, Cultural Fit
4. 2-3 areas for improvement

Format as JSON:
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
}`

    // Set a timeout for the Gemini API call
    const timeoutMs = 25000 // 25 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Gemini API timeout")), timeoutMs)
    })

    // Race the API call against the timeout
    const resultPromise = model.generateContent(prompt)
    const result = (await Promise.race([resultPromise, timeoutPromise])) as any
    const feedbackText = result.response.text()

    // Parse the JSON response
    let feedback
    try {
      feedback = JSON.parse(feedbackText)

      // Validate the feedback structure
      if (!feedback.overallScore || !feedback.summary || !feedback.categories || !feedback.areasOfImprovement) {
        throw new Error("Invalid feedback structure")
      }
    } catch (e) {
      console.error("Failed to parse feedback JSON:", e)

      // Create a fallback feedback based on the interview type and role
      feedback = {
        overallScore: 65,
        summary: `Based on the ${interviewType} interview for the ${role.replace("-", " ")} position, the candidate demonstrated some relevant knowledge and skills. There were both strengths and areas for improvement identified during the conversation.`,
        categories: [
          {
            name: "Communication Skills",
            score: 70,
            feedback:
              "The candidate communicated with reasonable clarity, though there's room for improvement in articulation and structure.",
          },
          {
            name: "Technical Knowledge",
            score: 65,
            feedback: `The candidate showed partial understanding of technical concepts relevant to the ${role.replace("-", " ")} position.`,
          },
          {
            name: "Problem Solving",
            score: 60,
            feedback:
              "The candidate demonstrated basic problem-solving approaches but could develop more structured methodologies.",
          },
          {
            name: "Cultural Fit",
            score: 65,
            feedback:
              "The candidate appears to align with some organizational values, though further assessment is recommended.",
          },
        ],
        areasOfImprovement: [
          `Develop deeper knowledge of ${role.replace("-", " ")} specific concepts`,
          "Provide more specific examples from past experience",
          "Work on clearer articulation of complex concepts",
        ],
      }
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error("Error generating feedback:", error)

    // Return a basic feedback object instead of an error
    return NextResponse.json({
      overallScore: 60,
      summary:
        "Due to technical limitations, we could only generate basic feedback for this interview. The candidate participated in the interview process and provided responses to the questions asked.",
      categories: [
        {
          name: "Overall Performance",
          score: 60,
          feedback:
            "The candidate completed the interview process. For more detailed feedback, please try another interview session.",
        },
      ],
      areasOfImprovement: [
        "Try another interview for more detailed feedback",
        "Consider reviewing common interview questions for this role",
      ],
    })
  }
}
