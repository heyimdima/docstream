import uvicorn
import os
from fastapi import FastAPI, HTTPException, Depends
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from backend.rag_chain.rag_response import search_pinecone, stream_chatgpt_response
from pydantic import BaseModel
from backend.models.rag. models import StreamResponseRequest

app = FastAPI(
    title="Documentation API",
    description="API for documentation crawling and querying",
    version="0.1.0"
)

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
VERCEL_URL = os.environ.get("VERCEL_URL", "")
ALLOWED_ORIGINS = [f"https://{VERCEL_URL}"] if VERCEL_URL else ["*"]

# Then update your CORS middleware:
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"] if ENVIRONMENT == "production" else ["*"],
    allow_headers=["Content-Type", "Authorization"] if ENVIRONMENT == "production" else ["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/stream_response")
async def stream_response(request: StreamResponseRequest):
    prompt = request.chatHistory[-1].content

    chat_history = request.chatHistory
    chat_history.pop()

    documentations = request.chatDocumentations

    search_result = search_pinecone(prompt, documentations)
    
    response = StreamingResponse(
        stream_chatgpt_response(
            prompt, 
            search_result, 
            chat_history
        ), 
        media_type="text/markdown"
    )
    
    return response

# @app.post("/stream_response")
# async def stream(request: StreamResponseRequest):
#     try:
#         prompt = request.chatHistory[-1].content
#         chat_history = request.chatHistory[:-1]
#         documentations = request.chatDocumentations
        

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"ERROR: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
