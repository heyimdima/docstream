// app/api/stream-response/route.ts
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, chatDocumentations } = await request.json();

    // Pass the request to your FastAPI backend
    const response = await fetch(process.env.BACKEND_API_URL + "/stream_response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatHistory,
        chatDocumentations,
      }),
    });

    // Make sure the response is ok
    if (!response.ok) {
      throw new Error(`Error from API: ${response.status}`);
    }

    // Return a streaming response with the same media type as your FastAPI endpoint
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/markdown",
      },
    });
  } catch (error) {
    console.error("Error streaming response:", error);
    return new Response(JSON.stringify({ error: "Failed to stream response" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
