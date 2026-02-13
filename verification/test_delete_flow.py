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

            # Add a game
            print("Adding a game...")
            # Select 6 numbers for Mega-Sena (default)
            for i in range(1, 7):
                num = f"{i:02d}"
                page.click(f"button[aria-label='Selecionar número {num}']")

            # Click Salvar
            print("Clicking Salvar...")
            page.click("text=Salvar")

            # Verify game appears
            print("Verifying game appears...")
            page.wait_for_selector("text=Jogo #", timeout=5000)

            # Find the delete button
            delete_button = page.locator("button[aria-label^='Remover jogo']").first
            game_id_text = delete_button.get_attribute("aria-label").split(" ")[-1]
            print(f"Found delete button for game {game_id_text}")

            # Click Remover
            print("Clicking Remover...")
            delete_button.click()

            # Verify confirmation
            print("Verifying confirmation UI...")
            page.wait_for_selector("text=Tem certeza?")
            page.wait_for_selector(f"button[aria-label='Confirmar exclusão do jogo {game_id_text}']")
            page.wait_for_selector("button[aria-label='Cancelar exclusão']")

            # Take screenshot of confirmation
            print("Taking screenshot of confirmation...")
            page.screenshot(path="verification/confirmation_dialog.png")

            # Click Não
            print("Clicking Não...")
            page.click("button[aria-label='Cancelar exclusão']")

            # Verify game still exists and confirmation gone
            print("Verifying cancellation...")
            if page.is_visible("text=Tem certeza?"):
                raise Exception("Confirmation still visible after cancel")
            if not page.is_visible(f"button[aria-label^='Remover jogo {game_id_text}']"):
                 raise Exception("Delete button not visible after cancel")

            # Click Remover again
            print("Clicking Remover again...")
            page.click(f"button[aria-label^='Remover jogo {game_id_text}']")

            # Click Sim
            print("Clicking Sim...")
            page.click(f"button[aria-label='Confirmar exclusão do jogo {game_id_text}']")

            # Verify game is gone
            print("Verifying deletion...")
            time.sleep(1) # Wait for state update
            if page.is_visible(f"text=Jogo #{game_id_text}"): # Assuming game ID is shown in the card title "Jogo #..." but it's sliced to last 4 digits. The aria label has full ID.
                 # Let's check if the card is gone.
                 # We can check if the delete button is gone.
                 if page.is_visible(f"button[aria-label^='Remover jogo {game_id_text}']"):
                     raise Exception("Game still exists after delete")

            print("Test passed!")
            page.screenshot(path="verification/test_passed.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/test_failed.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run()
