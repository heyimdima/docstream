from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter, Language
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

def smart_split_markdown_document(
    markdown_document: MarkdownDocument,
    max_tokens: int = 600,
    min_tokens: int = 300,
    combine_small_chunks: bool = True
) -> SplitMarkdownDocument:
    """
    Splits a markdown document by headers, ensuring chunks are of appropriate size,
    and optionally combines small chunks to reduce fragmentation.

    Args:
        markdown_document: The original markdown document
        max_tokens: Maximum token size for each chunk (default: 500)
        min_tokens: Minimum preferred token size for chunks (default: 150)
        combine_small_chunks: Whether to combine small chunks (default: True)

    Returns:
        A SplitMarkdownDocument with optimally sized chunks
    """
    # Step 1: Initial splitting by headers
    markdown_splitter = MarkdownHeaderTextSplitter([("#", "Header"), ("##", "Subheader")], strip_headers=False)
    markdown_header_splits = markdown_splitter.split_text(markdown_document.markdown)

    # Initialize an empty list to store the preliminary chunks
    preliminary_chunks = []
    chunk_index = 0

    # Step 2: Process each split, further subdividing if necessary
    for split in markdown_header_splits:
        token_count = count_tokens(split.page_content)

        if token_count <= max_tokens:
            # This chunk is small enough, add it directly
            chunk = SplitMarkdownDocumentChunk(chunk=chunk_index, markdown=split.page_content)
            preliminary_chunks.append(chunk)
            chunk_index += 1
        else:
            # This chunk is too large, split it further by deeper headers
            markdown_sub_splitter = MarkdownHeaderTextSplitter([("###", "SubSubHeader")], strip_headers=False)
            markdown_header_sub_splits = markdown_sub_splitter.split_text(split.page_content)

            for sub_split in markdown_header_sub_splits:
                sub_token_count = count_tokens(sub_split.page_content)

                if sub_token_count <= max_tokens:
                    # This sub-chunk is small enough, add it directly
                    sub_chunk = SplitMarkdownDocumentChunk(chunk=chunk_index, markdown=sub_split.page_content)
                    preliminary_chunks.append(sub_chunk)
                    chunk_index += 1
                else:
                    # This sub-chunk is still too large, split it by even deeper headers
                    markdown_sub_sub_splitter = MarkdownHeaderTextSplitter([("####", "SubSubSubHeader")], strip_headers=False)
                    markdown_header_sub_sub_splits = markdown_sub_sub_splitter.split_text(sub_split.page_content)

                    for sub_sub_split in markdown_header_sub_sub_splits:
                        sub_sub_token_count = count_tokens(sub_sub_split.page_content)

                        # If still too large, we could further split by paragraphs
                        # but for simplicity, we'll just add it and note that it's large
                        sub_sub_chunk = SplitMarkdownDocumentChunk(chunk=chunk_index, markdown=sub_sub_split.page_content)
                        preliminary_chunks.append(sub_sub_chunk)
                        chunk_index += 1

    # Step 3 (Optional): Combine small chunks if enabled
    if not combine_small_chunks:
        return SplitMarkdownDocument(source_url=markdown_document.source_url, chunks=preliminary_chunks)

    # Calculate token counts for each chunk
    chunks_with_tokens = []
    for chunk in preliminary_chunks:
        token_count = count_tokens(chunk.markdown)
        chunks_with_tokens.append((chunk, token_count))

    # Now combine small chunks that fit within the token limit
    final_chunks = []

    if not chunks_with_tokens:
        return SplitMarkdownDocument(source_url=markdown_document.source_url, chunks=[])

    current_chunk = chunks_with_tokens[0][0]
    current_tokens = chunks_with_tokens[0][1]
    current_markdown = current_chunk.markdown

    for next_chunk, next_tokens in chunks_with_tokens[1:]:
        combined_tokens = current_tokens + next_tokens

        # Combine if:
        # 1. The combined chunk stays under max_tokens AND
        # 2. Either the current chunk or next chunk is below min_tokens
        if (combined_tokens <= max_tokens and
            (current_tokens < min_tokens or next_tokens < min_tokens)):

            # Try to maintain header hierarchy by adding a newline
            current_markdown += "\n\n" + next_chunk.markdown
            current_tokens = combined_tokens
        else:
            # Add current chunk to results
            final_chunks.append(
                SplitMarkdownDocumentChunk(
                    chunk=len(final_chunks),
                    markdown=current_markdown
                )
            )
            # Start a new chunk
            current_markdown = next_chunk.markdown
            current_tokens = next_tokens

    # Don't forget to add the last chunk
    final_chunks.append(
        SplitMarkdownDocumentChunk(
            chunk=len(final_chunks),
            markdown=current_markdown
        )
    )

    # Create and return the final document
    return SplitMarkdownDocument(
        source_url=markdown_document.source_url,
        chunks=final_chunks
    )

def smart_split_markdown_documents(documents: List[MarkdownDocument]) -> List[SplitMarkdownDocument]:
    return [smart_split_markdown_document(doc) for doc in documents]

def post_process(header_split_document: SplitMarkdownDocument) -> SplitMarkdownDocument:
    recursive_splitter = RecursiveCharacterTextSplitter.from_language(
        language=Language.MARKDOWN,
        chunk_size=500,
        chunk_overlap=0
    )

    post_processed_chunks = []
    chunk_index = 0

    for chunk in header_split_document.chunks:
        if count_tokens(chunk.markdown) > 600:
            smaller_chunks = recursive_splitter.split_text(chunk.markdown)
            for smaller_chunk in smaller_chunks:
                chunk_index += 1
                post_processed_chunks.append(SplitMarkdownDocumentChunk(
                    chunk=chunk_index,
                    markdown=smaller_chunk
                ))
        else:
            chunk_index += 1
            post_processed_chunks.append(SplitMarkdownDocumentChunk(
                chunk=chunk_index,
                markdown=chunk.markdown
            ))

    return SplitMarkdownDocument(
        source_url=header_split_document.source_url,
        chunks=post_processed_chunks
    )

def post_process_markdowns(header_split_documents: List[SplitMarkdownDocument]) -> List[SplitMarkdownDocument]:
    return [post_process(doc) for doc in header_split_documents]
