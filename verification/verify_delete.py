from playwright.sync_api import sync_playwright

def verify_delete():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000")

            # Wait for any tab panel to ensure hydration/render
            try:
                page.wait_for_selector('div[role="tabpanel"]', timeout=10000)
            except:
                print("❌ Initial load timeout")
                return

            # Click on 'Meus Jogos' tab
            page.click('#tab-games')
            print("✅ Clicked Meus Jogos tab")

            # Wait for games panel
            page.wait_for_selector('#panel-games')
            print("✅ Games panel visible")

            # Select 6 numbers (Mega-Sena default)
            # The grid buttons are inside the panel
            # Numbers are "01", "02", ...
            for i in range(1, 7):
                num = f"{i:02d}"
                selector = f'button[aria-label="Selecionar número {num}"]'
                page.click(selector)
                print(f"   Selected {num}")

            # Click Save
            # Button with "Salvar" text inside
            page.click('button:has-text("Salvar")')
            print("✅ Clicked Save")

            # Verify game is added
            # The game card has "Jogo #" text
            try:
                page.wait_for_selector('text=Jogo #', timeout=2000)
                print("✅ Game added to list")
            except:
                print("❌ Game not added!")
                page.screenshot(path="verification/add_failed.png")
                return

            # Find the "Remover" button for the new game
            # We assume it's the first one if list was empty, or just pick the first
            remove_btn = page.locator('button:has-text("Remover")').first
            if remove_btn.count() == 0:
                print("❌ No remove button found")
                return

            print("✅ Found Remove button")
            remove_btn.click()
            print("✅ Clicked Remove")

            # Verify Confirmation
            # "Sim" button should appear
            try:
                sim_btn = page.locator('button:has-text("Sim")')
                sim_btn.wait_for(state='visible', timeout=2000)
                print("✅ Confirmation buttons appeared (State is working!)")
            except:
                print("❌ Confirmation buttons NOT found (State might be broken)")
                page.screenshot(path="verification/delete_state_failed.png")
                return

            # Click Sim to complete deletion
            sim_btn.click()
            print("✅ Clicked Sim")

            # Verify game is gone
            # Wait for "Sim" to disappear
            sim_btn.wait_for(state='detached')
            print("✅ Game removed successfully")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/delete_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_delete()
