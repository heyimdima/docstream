from pydantic import BaseModel
from typing import List, Literal, Optional
from datetime import datetime

class SemanticMatch(BaseModel):
    pinecone_chunk_id: str
    documentation_id: str
    content: str
    source_url: str
    tokens: int
    score: float

class Message(BaseModel):
    id: Optional[str] = None
    chat_id: str
    role: Literal['user', 'ai']
    content: str
    created_at: datetime

class ChatDocumentation(BaseModel):
    id: str
    chat_id: str
    documentation_id: str
    attached_at: datetime

class StreamResponseRequest(BaseModel):
    chatHistory: List[Message]
    documentations: List[ChatDocumentation] = []