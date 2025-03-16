from pydantic import BaseModel
from typing import List

class HTMLDocument(BaseModel):
    source_url: str
    html: str

class MarkdownDocument(BaseModel):
    source_url: str
    markdown: str

class SplitMarkdownDocumentChunk(BaseModel):
    chunk: int
    markdown: str

class SplitMarkdownDocument(BaseModel):
    source_url: str
    chunks: List[SplitMarkdownDocumentChunk]
