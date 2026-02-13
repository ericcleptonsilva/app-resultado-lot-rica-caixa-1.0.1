from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000")

            # Wait for the page to load
            page.wait_for_selector("h1")

            # Click "Meus Jogos" tab
            print("Clicking 'Meus Jogos' tab...")
            page.click("text=Meus Jogos")

            # Wait for the grid to appear
            print("Waiting for grid...")
            page.wait_for_selector("text=Faça seu Jogo")

            # Verify "Estratégia" button exists
            print("Verifying 'Estratégia' button...")
            page.wait_for_selector("button:has-text('Estratégia')")

            # Click "Estratégia"
            print("Clicking 'Estratégia'...")
            page.click("button:has-text('Estratégia')")

            # Wait for numbers to be selected (Mega Sena = 6 numbers)
            time.sleep(1)

            # Count selected numbers
            # Selected buttons have aria-pressed="true"
            selected = page.locator("button[aria-pressed='true']")
            count = selected.count()
            print(f"Selected numbers count: {count}")

            if count != 6:
                raise Exception(f"Expected 6 selected numbers, found {count}")

            # Verify the numbers are distinct and valid? (implicitly verified by count)

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/smart_pick_verified.png")
            print("Test passed!")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/smart_pick_failed.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
