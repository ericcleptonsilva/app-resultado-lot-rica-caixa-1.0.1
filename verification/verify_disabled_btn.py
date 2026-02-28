from playwright.sync_api import sync_playwright, expect

def test_disabled_button(page):
    # Route both API and module resolving things that could block
    page.route("**/portaldeloterias/api/**", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"numero": 1234, "dataApuracao": "10/10/2023", "dezenasSorteadasOrdemSorteio": ["01", "02", "03", "04", "05", "06"], "valorAcumuladoProximoConcurso": 1000000}'
    ))

    # Give a bit of explicit timeout for network idle
    page.goto("http://localhost:3000")

    # We need to click "Meus Jogos" to see the "Salvar" button
    jogos_tab = page.get_by_role("tab", name="Meus Jogos")
    jogos_tab.click()

    salvar_btn = page.locator('button', has_text="Salvar")

    # Wait for the button
    expect(salvar_btn).to_be_visible()

    # Assert it is disabled initially
    expect(salvar_btn).to_be_disabled()

    # Take a screenshot to show the disabled state
    page.screenshot(path="/home/jules/verification/disabled_button.png")

    # Assert it has the correct title
    expect(salvar_btn).to_have_attribute("title", "Selecione exatamente 6 números")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_disabled_button(page)
            print("Verification passed.")
        finally:
            browser.close()
