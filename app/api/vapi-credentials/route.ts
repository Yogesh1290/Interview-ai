import { NextResponse } from "next/server"

export async function GET() {
  // For security, we'll use environment variables if available
  // Otherwise, use the public key directly (not ideal for production)
  const apiKey = process.env.VAPI_API_KEY || "d2c804ff-8e08-44c7-b4ca-50a5c6d00624"
  const assistantId = process.env.VAPI_ASSISTANT_ID || "your-assistant-id" // Replace with your actual assistant ID

  return NextResponse.json({
    apiKey,
    assistantId,
  })
}
