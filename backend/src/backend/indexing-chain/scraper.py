# %%
import asyncio
import requests
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig, CacheMode
from bs4 import BeautifulSoup
from backend.models.indexing.models import HTMLDocument

def get_urls_from_sitemap(sitemap_url):
    response = requests.get(sitemap_url)
    soup = BeautifulSoup(response.content, 'xml')
    return [loc.text for loc in soup.find_all('loc')]

def html_filter(html: str):
    soup = BeautifulSoup(html, 'html.parser')

    # Remove common elements that provide no semantic value
    for element in soup.find_all(['nav', 'header', 'footer', 'script', 'style', 'meta', 'link', 'noscript', 'iframe', 'svg', 'img', 'hr']):
        element.decompose()

    # Remove code lines
    for element in soup.find_all("div", class_="linenodiv"):
        element.decompose()

    # Remove code lines
    for element in soup.find_all("span", class_="ch-code-line-number"):
        element.decompose()

    # Unwrap anchors
    for anchor in soup.find_all(['a', 'strong', 'abbr']):
        anchor.unwrap()

    for span in soup.find_all('span', string='#'):
        span.decompose()

    # Remove empty tags (excluding self-closing tags)
    for tag in soup.find_all():
        if not tag.get_text(strip=True) and tag.name not in ['br', 'hr', 'img', 'input']:
            tag.decompose()


    # Strip ALL attributes from all tags, keeping only tag names and content
    for tag in soup.find_all(True):
        tag.attrs = {}  # Simply clear all attributes by assigning an empty dict

    article = soup.article

    if article:
        article = article.extract()

    if article:
        return str(article.prettify())
    else:
        print("[WARNING]: -> No <article> tag found, returning HTML with basic filter.")
        return str(soup.prettify())

scrape_results = []

async def process_result(result):
    if result.success:
        scrape_result = HTMLDocument(
            source_url=result.url,
            html=html_filter(result.html)
            # html=html_filter(result.cleaned_html)
        )
        scrape_results.append(scrape_result)
    else:
        print(f"[CRAWL FAIL FOR]: -> {result.url}]")
        print(f"[ERROR MESSAGE] : -> {result.error}")


async def crawl_batch_parallel(urls, max_concurrent=2):
    browser_config = BrowserConfig(
        headless=True,
        verbose=True,
        extra_args=["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
    )
    crawl_config = CrawlerRunConfig(cache_mode=CacheMode.BYPASS)

    # Start crawler explicitly
    crawler = AsyncWebCrawler(config=browser_config)
    await crawler.start()

    try:
        success_count = 0
        fail_count = 0

        # Process URLs in batches of max_concurrent
        for i in range(0, len(urls), max_concurrent):
            batch = urls[i:i + max_concurrent]
            tasks = []

            print(f"↓[Processing batch {i//max_concurrent + 1} with {len(batch)} URLs]↓")

            # Create tasks for this batch with unique session IDs
            for j, url in enumerate(batch):
                session_id = f"batch_{i//max_concurrent + 1}_session_{j}"
                task = crawler.arun(url=url, config=crawl_config, session_id=session_id)
                tasks.append(task)

            # Run this batch in parallel
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            # Process results for this batch
            for url, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    print(f"Error crawling {url}: {result}")
                    fail_count += 1
                elif result.success:
                    success_count += 1
                    await process_result(result)
                else:
                    fail_count += 1
        print(f"\n[SCRAPER SUMMARY] → SUCCESS: [{success_count}] | FAIL: [{fail_count}]")

    finally:
        print("[CLOSING CRAWLER]")
        await crawler.close()

urls = get_urls_from_sitemap("https://supabase.com/docs/sitemap.xml")[:10]
# for url in urls:
#     print(url)

asyncio.create_task(crawl_batch_parallel(urls, max_concurrent=5))

# %%
from converter import convert_htmls_to_markdowns, convert_to_mds
from splitter import split_markdown_documents_by_headers, smart_split_markdown_documents, post_process_markdowns
from backend.helpers.tokenizer import count_tokens

print(scrape_results[6].html)

# %%
# markdowns_from_html = convert_htmls_to_markdowns(scrape_results)
markdowns_from_html = convert_to_mds(scrape_results)

# %%
# split_markdowns = split_markdown_documents_by_headers(markdowns_from_html)
split_markdowns = smart_split_markdown_documents(markdowns_from_html)

total_chunks_after_smart_split = 0
for markdown in split_markdowns:
    total_chunks_after_smart_split += len(markdown.chunks)
print(total_chunks_after_smart_split)

# %%
processed_markdowns = post_process_markdowns(split_markdowns)

total_chunks_after_post_processing = 0
for processed_md in processed_markdowns:
    total_chunks_after_post_processing += len(processed_md.chunks)
print(total_chunks_after_post_processing)

# %%
chunks_over_800_tokens = 0
for processed_md in processed_markdowns:
    print("--------------------------------------------------")
    print(f"DOCUMENT: [{processed_md.source_url}]")
    for chunk in processed_md.chunks:
        if count_tokens(chunk.markdown) > 800:
            chunks_over_800_tokens += 1
        print(f"CHUNK: [{chunk.chunk}] | TOKENS: [{count_tokens(chunk.markdown)}]")
        print(f"{chunk.markdown}")
        print("-----------------------------------------------SPLIT-------------------------------------------------------")
        print()
        print()

print(f"Number of chunks over 800 tokens: {chunks_over_800_tokens}")

# %%
