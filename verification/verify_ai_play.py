from playwright.sync_api import sync_playwright
import time
import json

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Mock the AI prediction API
        def handle_predict(route):
            response_body = {
                "text": json.dumps({
                    "numbers": ["01", "02", "03", "04", "05", "06"],
                    "message": "Sorte simulada para teste!"
                })
            }
            route.fulfill(
                status=200,
                content_type="application/json",
                body=json.dumps(response_body)
            )

        page.route("**/api/predict", handle_predict)

        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for the page to load
            page.wait_for_selector("h1")

            # Find and click "Gerar Palpite Inteligente"
            print("Clicking 'Gerar Palpite Inteligente'...")
            page.click("button:has-text('Gerar Palpite Inteligente')")

            # Wait for "Jogar Agora" button
            print("Waiting for prediction and 'Jogar Agora' button...")
            page.wait_for_selector("button:has-text('Jogar Agora')")

            # Click "Jogar Agora"
            print("Clicking 'Jogar Agora'...")
            page.click("button:has-text('Jogar Agora')")

            # Verify tab switch
            # "Meus Jogos" tab should be selected
            print("Verifying tab switch...")
            # We can check aria-selected="true" on the tab button
            # The tab button has text "Meus Jogos"
            expect_tab = page.locator("button[role='tab'][aria-selected='true']")
            tab_text = expect_tab.inner_text()
            print(f"Active tab text: {tab_text}")

            if "Meus Jogos" not in tab_text:
                raise Exception(f"Expected active tab to be 'Meus Jogos', but got '{tab_text}'")

            # Verify numbers are selected in the grid
            # We expect 01, 02, 03, 04, 05, 06 to be selected
            print("Verifying selected numbers...")
            # Wait for grid to be visible (it's in the games tab)
            page.wait_for_selector("text=Faça seu Jogo")

            # Check specific numbers
            for num in ["01", "02", "03", "04", "05", "06"]:
                # Select button with text 'num' and aria-pressed='true'
                # The button text matches exactly.
                # locator needs to be precise.
                # aria-label="Selecionar número XX"
                btn = page.locator(f"button[aria-label='Selecionar número {num}'][aria-pressed='true']")
                if btn.count() == 0:
                     raise Exception(f"Number {num} was not selected!")

            print("All numbers selected correctly!")

            # Take screenshot
            page.screenshot(path="verification/verify_ai_play_passed.png")
            print("Test passed!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/verify_ai_play_failed.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
