from langchain_text_splitters import MarkdownHeaderTextSplitter
from backend.models.indexing.models import MarkdownDocument, SplitMarkdownDocument, SplitMarkdownDocumentChunk
from backend.helpers.tokenizer import count_tokens
from typing import List

def split_markdown_document_by_headers(markdown_document: MarkdownDocument) -> SplitMarkdownDocument:
    markdown_splitter = MarkdownHeaderTextSplitter([("#", "Header"), ("##", "Subheader")], strip_headers=False)
    markdown_header_splits = markdown_splitter.split_text(markdown_document.markdown)

    # Initialize an empty list to store the SplitMarkdownDocumentChunks
    final_chunks = []
    chunk_index = 0

    for split in markdown_header_splits:
        token_count = count_tokens(split.page_content)

        if token_count <= 500:
            chunk = SplitMarkdownDocumentChunk(chunk=chunk_index, markdown=split.page_content)
            final_chunks.append(chunk)
            chunk_index += 1
        else:
            markdown_sub_splitter = MarkdownHeaderTextSplitter([("###", "SubSubHeader")], strip_headers=False)
            markdown_header_sub_splits = markdown_sub_splitter.split_text(split.page_content)

            for sub_split in markdown_header_sub_splits:
                sub_token_count = count_tokens(sub_split.page_content)

                if sub_token_count <= 500:
                    sub_chunk = SplitMarkdownDocumentChunk(chunk=chunk_index, markdown=sub_split.page_content)
                    final_chunks.append(sub_chunk)
                    chunk_index += 1
                else:
                    markdown_sub_sub_splitter = MarkdownHeaderTextSplitter([("####", "SubSubSubHeader")], strip_headers=False)
                    markdown_header_sub_sub_splits = markdown_sub_sub_splitter.split_text(sub_split.page_content)

                    for sub_sub_split in markdown_header_sub_sub_splits:
                        sub_sub_chunk = SplitMarkdownDocumentChunk(chunk=chunk_index, markdown=sub_sub_split.page_content)
                        final_chunks.append(sub_sub_chunk)
                        chunk_index += 1

    # Create and return the SplitMarkdownDocument
    return SplitMarkdownDocument(source_url=markdown_document.source_url, chunks=final_chunks)


def split_markdown_documents_by_headers(markdown_documents: List[MarkdownDocument]) -> List[SplitMarkdownDocument]:
    return [split_markdown_document_by_headers(document) for document in markdown_documents]
