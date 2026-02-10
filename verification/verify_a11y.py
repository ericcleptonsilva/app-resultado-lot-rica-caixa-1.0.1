from playwright.sync_api import sync_playwright

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

            # Check grid buttons. The grid container has style "flexWrap: wrap" (camelCase in JS, likely inline style in DOM will be hyphenated or camelCase depending on React rendering, but locating by role button inside the card is safer)
            # React inline styles are rendered as inline styles. "flex-wrap: wrap" usually.

            print("Checking grid buttons...")
            # We look for buttons that have numbers as text, inside the grid container
            # The grid container follows "Selecione os números abaixo."

            buttons = page.locator("button[aria-label^='Selecionar número']")
            count = buttons.count()
            print(f"Found {count} buttons in grid.")

            if count == 0:
                print("Error: No buttons found with correct aria-label!")
                # Take screenshot anyway
                page.screenshot(path="verification/grid_error.png")
            else:
                first_button = buttons.first
                aria_label = first_button.get_attribute("aria-label")
                type_attr = first_button.get_attribute("type")

                print(f"First button aria-label: {aria_label}")
                print(f"First button type: {type_attr}")

                if type_attr != "button":
                     print("Error: Incorrect or missing type attribute")

            # Check Lottery Select aria-label
            print("Checking Lottery Select...")
            select = page.locator("select")
            select_label = select.get_attribute("aria-label")
            print(f"Select aria-label: {select_label}")

            if select_label != "Selecione a loteria":
                 print("Error: Select missing aria-label")

            # Take screenshot
            print("Taking screenshot...")
            page.screenshot(path="verification/verification.png")
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
