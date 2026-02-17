from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    try:
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")

        # Check tablist
        tablist = page.locator('[role="tablist"]')
        print(f"Tablist count: {tablist.count()}")
        if tablist.count() > 0:
            print(f"Tablist visible: {tablist.is_visible()}")

        # Check tabs
        tab_results = page.locator('#tab-results')
        tab_games = page.locator('#tab-games')

        # Wait for hydration/render if needed
        tab_results.wait_for()

        print(f"Results tab aria-selected: {tab_results.get_attribute('aria-selected')}")

        # Verify initial state (Results active)
        # Note: aria-selected might be string 'true' or boolean true depending on browser/framework, usually string in DOM
        assert tab_results.get_attribute('aria-selected') == 'true', "Results tab should be selected initially"

        # Check panel
        panel_results = page.locator('#panel-results')
        print(f"Results panel visible: {panel_results.is_visible()}")

        # Click Games tab
        tab_games.click()
        # Wait for state update
        page.wait_for_timeout(500)

        print(f"Games tab aria-selected after click: {tab_games.get_attribute('aria-selected')}")
        assert tab_games.get_attribute('aria-selected') == 'true', "Games tab should be selected after click"

        # Check games panel
        panel_games = page.locator('#panel-games')
        panel_games.wait_for()
        print(f"Games panel visible: {panel_games.is_visible()}")

        page.screenshot(path="verification_tabs.png")
        print("Verification successful!")
    except Exception as e:
        print(f"Verification failed: {e}")
        page.screenshot(path="verification_failure.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
