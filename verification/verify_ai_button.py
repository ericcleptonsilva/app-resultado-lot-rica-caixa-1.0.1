import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 1024}) # Larger viewport
    page = context.new_page()

    # Mock the API response for prediction
    page.route("**/api/predict", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"text": "{\\"numbers\\": [\\"05\\", \\"12\\", \\"23\\", \\"34\\", \\"45\\", \\"56\\"], \\"message\\": \\"Sorte e prosperidade!\\"}"}'
    ))

    # Mock the lottery result fetch to avoid network issues
    page.route("**/megasena", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='{"numero": 2500, "dataApuracao": "01/01/2023", "listaDezenas": ["01", "02", "03", "04", "05", "06"], "acumulado": true, "proximoConcurso": 2501, "dataProximoConcurso": "05/01/2023", "valorEstimadoProximoConcurso": 10000000}'
    ))

    print("Navigating to app...")
    page.goto("http://localhost:3000")

    # Wait for the page to load
    page.wait_for_timeout(2000)

    print("Clicking 'Gerar Palpite Inteligente'...")
    # Scroll to the button
    generate_btn = page.get_by_role("button", name="Gerar Palpite Inteligente")
    generate_btn.scroll_into_view_if_needed()
    generate_btn.click()

    # Wait for the prediction to appear (mocked API should be fast)
    page.wait_for_timeout(1000)

    # Check for the "Jogar Agora" button
    print("Checking for 'Jogar Agora' button...")
    play_button = page.get_by_label("Usar estes números para jogar")

    if play_button.is_visible():
        print("Button 'Jogar Agora' found!")
        play_button.scroll_into_view_if_needed()
    else:
        print("Button 'Jogar Agora' NOT found!")
        page.screenshot(path="verification/error.png")
        browser.close()
        return

    # Take a screenshot showing the AI prediction and the new button
    page.screenshot(path="verification/ai_prediction.png", full_page=True)
    print("Screenshot taken: ai_prediction.png")

    # Click the button
    print("Clicking 'Jogar Agora'...")
    play_button.click()

    # Wait for tab switch and scroll
    page.wait_for_timeout(1000)

    # Verify we are on "Meus Jogos" tab
    games_tab = page.locator("#tab-games")
    is_selected = games_tab.get_attribute("aria-selected")
    print(f"Games tab selected: {is_selected}")

    if is_selected != "true":
        print("Failed to switch tab!")

    # Verify numbers are selected in the grid
    # Numbers: 05, 12, 23, 34, 45, 56
    # Check if button for "05" has aria-pressed="true"
    btn_05 = page.get_by_label("Selecionar número 05")

    # We might need to switch focus to the grid
    if btn_05.is_visible():
         is_pressed = btn_05.get_attribute("aria-pressed")
         print(f"Number 05 selected: {is_pressed}")
    else:
         # It might be scrolled out of view if we didn't scroll to top properly
         # But the code says window.scrollTo({ top: 0, behavior: 'smooth' })
         # We'll see in the screenshot
         print("Number grid not visible!")

    # Take a screenshot of the games tab with selection
    page.screenshot(path="verification/games_tab_selected.png", full_page=True)
    print("Screenshot taken: games_tab_selected.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
