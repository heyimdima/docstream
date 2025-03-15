from langchain_text_splitters import MarkdownHeaderTextSplitter
from backend.models.indexing.models import MarkdownDocument, SplitMarkdownDocument, SplitMarkdownDocumentChunk
from typing import List

def split_markdown_document_by_headers(markdown_document: MarkdownDocument) -> SplitMarkdownDocument:
    markdown_splitter = MarkdownHeaderTextSplitter([("#", "Header"), ("##", "Subheader")], strip_headers=False)
    markdown_header_splits = markdown_splitter.split_text(markdown_document.markdown)

    # Initialize an empty list to store the SplitMarkdownDocumentChunks
    chunks = []

    # Process each split and create a SplitMarkdownDocumentChunk
    for i, split in enumerate(markdown_header_splits):
        chunk = SplitMarkdownDocumentChunk(chunk=i, markdown=split.page_content)
        chunks.append(chunk)

    # Create and return the SplitMarkdownDocument
    return SplitMarkdownDocument(source_url=markdown_document.source_url, chunks=chunks)

def split_markdown_documents_by_headers(markdown_documents: List[MarkdownDocument]) -> List[SplitMarkdownDocument]:
    return [split_markdown_document_by_headers(doc) for doc in markdown_documents]
