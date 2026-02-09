from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:3000/")

            # Wait for the page to load
            page.wait_for_selector('text=Loterias & IA', timeout=10000)

            # Click on "Meus Jogos" tab
            # Wait for the element first
            page.wait_for_selector('text=Meus Jogos')
            print("Clicking 'Meus Jogos'...")
            page.click('text=Meus Jogos')

            # Wait for the "Surpresinha" button
            page.wait_for_selector('text=Surpresinha')

            # Click "Surpresinha"
            print("Clicking 'Surpresinha'...")
            page.click('text=Surpresinha')

            # Wait a bit for the animation/state update
            page.wait_for_timeout(1000)

            # Take a screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/shuffle_test.png")

            # Verify we have selected numbers (we expect 6 for Mega-Sena)
            # The selected balls have a specific style, but we can check the text "6 / 6"
            content = page.content()
            # We check if "6 / 6" is present in the page content (e.g. in the header of the card)
            if "6 / 6" in content:
                print("Success: 6 numbers selected.")
            else:
                print("Failure: numbers not selected correctly.")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
