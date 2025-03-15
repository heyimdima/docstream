from pydantic import BaseModel

class HTMLDocument(BaseModel):
    source_url: str
    html: str

class MarkdownDocument(BaseModel):
    source_url: str
    markdown: str
