from playwright.sync_api import Page, expect, sync_playwright
import json
import re

def test_ai_button(page: Page):
    # Mock Caixa API
    def handle_caixa(route):
        route.fulfill(
            status=200,
            content_type='application/json',
            body=json.dumps({
                "numero": 2700,
                "dataApuracao": "10/10/2023",
                "listaDezenas": ["01", "02", "03", "04", "05", "06"],
                "acumulado": False,
                "proximoConcurso": 2701,
                "dataProximoConcurso": "13/10/2023",
                "valorEstimadoProximoConcurso": 1000000
            })
        )
    page.route('**/portaldeloterias/api/**', handle_caixa)

    # Mock AI Predict API
    def handle_predict(route):
        route.fulfill(
            status=200,
            content_type='application/json',
            body=json.dumps({
                "text": json.dumps({
                    "numbers": ["10", "20", "30", "40", "50", "60"],
                    "message": "The stars say yes."
                })
            })
        )
    # Be more flexible with the route matching
    page.route(re.compile(r'/api/predict'), handle_predict)

    # Navigate to app
    page.goto("http://localhost:3000")

    # Wait for app to load results
    page.wait_for_selector('text="CONCURSO 2700"')

    # Take screenshot before
    page.screenshot(path="verification/app_loaded.png")

    # Click 'Gerar Palpite Inteligente'
    page.get_by_role("button", name="Gerar Palpite Inteligente").click()

    # Click the new 'Jogar Agora' button
    jogar_agora_btn = page.get_by_role("button", name="Jogar com estes números")
    jogar_agora_btn.wait_for()
    expect(jogar_agora_btn).to_be_visible()

    # Take screenshot of the button state
    page.screenshot(path="verification/ai_prediction_button.png", full_page=True)

    jogar_agora_btn.click()

    # Verify we switched to the 'Meus Jogos' tab
    games_tab = page.get_by_role("tab", name="Meus Jogos")
    expect(games_tab).to_have_attribute("aria-selected", "true")

    # Wait for the Meus Jogos panel to become visible
    page.wait_for_selector('#panel-games')

    # Screenshot after click
    page.screenshot(path="verification/games_tab_after_click.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 1024})
        try:
            test_ai_button(page)
            print("Verification successful!")
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error_state.png", full_page=True)
            raise e
        finally:
            browser.close()
