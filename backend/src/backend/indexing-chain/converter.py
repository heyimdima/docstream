from html_to_markdown import convert_to_markdown
from typing import List
from backend.models.indexing.models import HTMLDocument, MarkdownDocument

# Convert single HTML document to Markdown document (mainly for testing purposes)
def convert_html_to_markdown(html_document: HTMLDocument) -> MarkdownDocument:
    return MarkdownDocument(
        source_url=html_document.source_url,
        markdown=convert_to_markdown(
            html_document.html,
            heading_style="atx",
            autolinks=True,
            bullets="*",
            escape_asterisks=True,
            escape_underscores=True,
            escape_misc=False,
            code_language="",
            newline_style="spaces",
            strong_em_symbol="*",
            wrap=False
        )
    )

# Convert multiple HTML documents to Markdown documents
def convert_htmls_to_markdowns(html_documents: List[HTMLDocument]) -> List[MarkdownDocument]:
    return [convert_html_to_markdown(html_document) for html_document in html_documents]
