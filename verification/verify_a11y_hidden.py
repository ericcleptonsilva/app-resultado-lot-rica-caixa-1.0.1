from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000")
        page.wait_for_selector("text=Resultado")

        # Verify aria-hidden on icons
        icons = page.locator(".material-icons")
        count = icons.count()
        print(f"Found {count} icons.")
        for i in range(count):
            is_hidden = icons.nth(i).get_attribute("aria-hidden")
            if is_hidden != "true":
                print(f"Icon {i} missing aria-hidden='true'")

        # The AI Box
        ai_box = page.locator("text=Palpite Místico").locator("..")
        print(f"AI Box aria-live: {ai_box.get_attribute('aria-live')}")

        page.screenshot(path="verification/a11y_hidden.png")

        browser.close()

if __name__ == "__main__":
    verify()
