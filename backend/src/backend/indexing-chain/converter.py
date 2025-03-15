from html_to_markdown import convert_to_markdown
from typing import List
from backend.models.indexing.models import HTMLDocument, MarkdownDocument

# Convert single HTML document to Markdown document (mainly for testing purposes)
def convert_html_to_markdown(html_document: HTMLDocument) -> MarkdownDocument:
    return MarkdownDocument(source_url=html_document.source_url, markdown=convert_to_markdown(html_document.html))

# Convert multiple HTML documents to Markdown documents
def convert_html_documents(html_documents: List[HTMLDocument]) -> List[MarkdownDocument]:
    return [MarkdownDocument(source_url=html_document.source_url, markdown=convert_to_markdown(html_document.html)) for html_document in html_documents]
