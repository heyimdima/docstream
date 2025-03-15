# %%
import asyncio
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig, CacheMode
from pydantic import BaseModel
from backend.helpers.tokenizer import count_tokens
from backend.helpers.html_filter import safe_html_filter

class ScrapeResult(BaseModel):
    source_url: str
    cleaned_html: str

scrape_results = []

async def process_result(result):
    if result.success:
        scrape_result = ScrapeResult(source_url=result.url, cleaned_html=result.cleaned_html)
        scrape_results.append(scrape_result)
    else:
        print(f"!!! Error crawling {result.url}: {result.error}")


async def crawl_batch_parallel(urls, max_concurrent=3):
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

        print(f"\n[SUMMARY] → SUCCESS: [{success_count}] | FAIL: [{fail_count}]")

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

# %% Scraped Results Summary
print(f"\n[Scrape Results] → {len(scrape_results)} pages scraped:")
for page in scrape_results:
    print(f"→ [CLEANED HTML] TOKENS: [{count_tokens(page.cleaned_html)}] | [{page.source_url}]")

# %% HTML Page from Crawl4AI
print(scrape_results[3].cleaned_html)

# %% HTML Page after Safe Filtering with bs4
print(safe_html_filter(scrape_results[3].cleaned_html))
