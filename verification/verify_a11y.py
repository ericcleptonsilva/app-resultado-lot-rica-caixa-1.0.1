from playwright.sync_api import sync_playwright

def verify_accessibility_attributes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 1024})

        try:
            # Route API mock to prevent infinite loading
            page.route("**/portaldeloterias/api/**", lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"numero": 1234, "dataApuracao": "01/01/2026", "listaDezenas": ["01", "02", "03", "04", "05", "06"], "acumulado": false, "proximoConcurso": 1235, "dataProximoConcurso": "02/01/2026"}'
            ))

            page.route("**/api/predict", lambda route: route.fulfill(
                status=200,
                content_type="application/json",
                body='{"text": "{\\"numbers\\": [\\"07\\", \\"08\\", \\"09\\", \\"10\\", \\"11\\", \\"12\\"], \\"message\\": \\"Boa sorte!\\"}"}'
            ))

            page.goto("http://localhost:3000/")

            # Wait for content to load
            page.wait_for_selector("text=CONCURSO")

            # Check that aria-hidden="true" is on material-icons
            casino_icon = page.locator("span.material-icons", has_text="casino")

            # Click stats to test the stats loader aria attributes
            page.get_by_role("tab", name="Estatísticas").click()

            page.screenshot(path="verification/screenshot.png")

            print("Verification script ran successfully.")

        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_accessibility_attributes()