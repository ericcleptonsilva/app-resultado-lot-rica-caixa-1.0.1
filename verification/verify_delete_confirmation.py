
from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print('Navigating to http://localhost:3000')
        try:
            page.goto('http://localhost:3000', timeout=60000)
        except Exception as e:
            print(f'Failed to navigate: {e}')
            browser.close()
            return

        print('Switching to Meus Jogos tab to access grid...')
        # Click Meus Jogos tab FIRST
        try:
            # The tab has text 'Meus Jogos'
            page.click('button:has-text("Meus Jogos")')
            # Wait for grid to appear
            page.wait_for_selector('button[aria-label="Selecionar número 01"]', timeout=5000)
        except Exception as e:
             print(f'Failed to switch tab: {e}')
             page.screenshot(path='verification/debug_tab_switch_failed.png')
             browser.close()
             return

        print('Selecting numbers...')
        # Select 6 numbers for Mega-Sena
        for i in range(1, 7):
            num = f'{i:02d}'
            # Use aria-label to select specific numbers
            selector = f'button[aria-label="Selecionar número {num}"]'
            try:
                page.click(selector)
            except Exception as e:
                print(f'Failed to click number {num}: {e}')

        print('Saving game...')
        # Click Salvar
        try:
            page.click('button:has-text("Salvar")')
        except Exception as e:
            print(f'Failed to save game: {e}')
            page.screenshot(path='verification/debug_save_failed.png')

        print('Waiting for game to appear...')
        try:
            page.wait_for_selector('text=Jogo #', timeout=5000)
        except Exception as e:
             print(f'Game did not appear: {e}')
             page.screenshot(path='verification/debug_no_game.png')

        print('Clicking Remover...')
        # Click Remover on the first game found
        try:
            page.click('button[aria-label^="Remover jogo"]')
        except Exception as e:
             print(f'Failed to click Remover: {e}')

        print('Waiting for confirmation...')
        try:
            page.wait_for_selector('text=Tem certeza?', timeout=5000)
            page.screenshot(path='verification/delete_confirmation.png')
            print('Success! Screenshot saved to verification/delete_confirmation.png')
        except Exception as e:
            print(f'Confirmation did not appear: {e}')
            page.screenshot(path='verification/debug_confirmation_failed.png')

        browser.close()

if __name__ == '__main__':
    run()
