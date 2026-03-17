from playwright.sync_api import sync_playwright

def verify_a11y(page):
    # Mocking Caixa API so we don't depend on external network
    def handle_caixa(route):
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{"numero": 2700, "dataApuracao": "01/01/2024", "listaDezenas": ["01", "02", "03", "04", "05", "06"], "acumulado": false, "proximoConcurso": 2701, "dataProximoConcurso": "05/01/2024"}'
        )
    page.route("**/portaldeloterias/api/**", handle_caixa)

    page.goto("http://localhost:4173") # Vite preview port
    page.wait_for_selector("text=Resultado")

    # Check if material-icons have aria-hidden
    icons = page.locator("span.material-icons").all()
    hidden_icons = 0
    for icon in icons:
        if icon.get_attribute("aria-hidden") == "true":
            hidden_icons += 1

    print(f"Found {len(icons)} material icons. {hidden_icons} are correctly aria-hidden.")

    # Check if aria-live="polite" is present on aiBox and loading containers
    # Wait for aiBox
    page.wait_for_selector("text=Palpite Místico")
    ai_box = page.locator("div", has_text="Palpite Místico").locator("..") # Get the container
    # Actually simpler to just check if there are divs with aria-live="polite"
    polite_divs = page.locator("div[aria-live='polite']").count()
    print(f"Found {polite_divs} containers with aria-live='polite'")

    page.screenshot(path="verification/screenshot.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        verify_a11y(page)
        browser.close()
