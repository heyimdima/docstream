from bs4 import BeautifulSoup

def safe_html_filter(html: str):

    soup = BeautifulSoup(html, 'lxml')

    for element in soup.find_all(['nav', 'header', 'footer', 'script', 'style', 'meta', 'link', 'noscript', 'iframe', 'svg', 'img']):
            element.decompose()

    soup.prettify() # TODO (Test later if this affects the Markdown conversion)


    return str(soup)
