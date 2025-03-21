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

class Documentation(BaseModel):
    id: str
    source_url: str
    name: str
    embedding_id: str
    updated_at: datetime
    created_at: datetime

class StreamResponseRequest(BaseModel):
    chatHistory: List[Message]
    chatDocumentations: List[Documentation]