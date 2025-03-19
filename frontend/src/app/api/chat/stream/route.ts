// app/api/stream-response/route.ts
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
import { Message } from "@/types/message";
import { ChatDocumentation } from "@/types/chat-documentation";

export async function POST(request: NextRequest) {
  try {
    const { chatHistory, documentations } = await request.json();

    // console.log("chatHistory", chatHistory);
    // console.log("documentations", documentations);

    // Pass the request to your FastAPI backend
    const response = await fetch(process.env.BACKEND_API_URL + "/stream_response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatHistory,
        documentations,
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
