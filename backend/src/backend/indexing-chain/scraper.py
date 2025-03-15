# %%
import asyncio
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig, CacheMode
from bs4 import BeautifulSoup
from backend.models.indexing.models import HTMLDocument

def html_filter(html: str):
    soup = BeautifulSoup(html, 'lxml')
    article = soup.article.extract()

    # Remove common elements that provide no semantic value
    for element in soup.find_all(['nav', 'header', 'footer', 'script', 'style', 'meta', 'link', 'noscript', 'iframe', 'svg', 'img']):
        element.decompose()

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
            html=html_filter(result.cleaned_html)
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

urls = [
    "https://supabase.com/docs/guides/auth/server-side",
    "https://supabase.com/docs/guides/auth/auth-email-passwordless",
    "https://supabase.com/docs/guides/database/postgres/cascade-deletes",
    "https://supabase.com/docs/guides/database/functions",
    "https://supabase.com/docs/guides/database/postgres/row-level-security"
]
asyncio.create_task(crawl_batch_parallel(urls, max_concurrent=2))
