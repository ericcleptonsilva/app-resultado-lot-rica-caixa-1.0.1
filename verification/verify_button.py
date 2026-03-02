from playwright.sync_api import sync_playwright, expect

def verify_salvar_button():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Use 1280x1024 as per memory guidelines
        context = browser.new_context(viewport={'width': 1280, 'height': 1024})
        page = context.new_page()

        # Mock APIs to avoid infinite loading
        page.route("**/portaldeloterias/api/**", lambda route: route.fulfill(
            status=200,
            json={
                "numero": 1000,
                "dataApuracao": "01/01/2026",
                "listaDezenas": ["01", "02", "03", "04", "05", "06"],
                "acumulado": False,
                "proximoConcurso": 1001,
                "dataProximoConcurso": "02/01/2026",
                "valorEstimadoProximoConcurso": 1000000
            }
        ))

        page.goto("http://localhost:3000")

        # Wait for the results to load (which unblocks the tabs)
        expect(page.get_by_text("CONCURSO 1000")).to_be_visible()

        # Click the 'Meus Jogos' tab as per memory
        tab = page.locator("#tab-games")
        tab.click()

        # Wait for the tabpanel to appear
        expect(page.locator("#panel-games")).to_be_visible()

        # Verify Salvar button is disabled by default (0 selected)
        salvar_button = page.get_by_role("button", name="Salvar")
        expect(salvar_button).to_be_disabled()

        # Check title attribute
        title_attr = salvar_button.get_attribute("title")
        assert title_attr == "Para Mega-Sena, selecione exatamente 6 números."

        # Take a screenshot of the disabled state
        page.screenshot(path="verification/salvar_disabled.png")

        # Select 6 numbers to enable it
        for i in range(1, 7):
            num = str(i).zfill(2)
            page.get_by_role("button", name=f"Selecionar número {num}").click()

        # Verify Salvar button is enabled
        expect(salvar_button).to_be_enabled()

        # Check title attribute is empty
        title_attr = salvar_button.get_attribute("title")
        assert title_attr == ""

        # Take a screenshot of the enabled state
        page.screenshot(path="verification/salvar_enabled.png")

        browser.close()

if __name__ == "__main__":
    verify_salvar_button()
