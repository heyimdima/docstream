from fastapi import FastAPI

app = FastAPI(title="Backend API")


@app.post("/stream_chat_response")
async def stream_response():
    return {"message": "Hello World"}
