from playwright.sync_api import sync_playwright

def verify_tabs():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000")

            # Wait for tablist to appear
            page.wait_for_selector('div[role="tablist"]')
            print("✅ Found tablist")

            # Wait for content to load (spinner disappears)
            # Or better, wait for the panel to appear
            try:
                page.wait_for_selector('div[role="tabpanel"]', timeout=10000)
                print("✅ Found tabpanel")
            except:
                print("❌ Tabpanel not found after waiting")
                # Take screenshot anyway
                page.screenshot(path="verification/tabs_accessibility_failed.png")
                return

            # Check Results Tab
            results_tab = page.locator('#tab-results')
            is_selected = results_tab.get_attribute('aria-selected')
            if is_selected == 'true':
                print("✅ Results tab is selected by default")
            else:
                print(f"❌ Results tab selection state: {is_selected}")

            # Check Panel Label
            panel = page.locator('div[role="tabpanel"]')
            aria_label = panel.get_attribute('aria-labelledby')
            if aria_label == 'tab-results':
                print("✅ Panel correctly labeled by tab-results")
            else:
                print(f"❌ Panel labeled by {aria_label}, expected tab-results")

            # Take screenshot
            page.screenshot(path="verification/tabs_accessibility.png")
            print("📸 Screenshot saved to verification/tabs_accessibility.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_tabs()
