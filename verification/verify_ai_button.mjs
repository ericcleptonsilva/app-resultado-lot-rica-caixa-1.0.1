import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1024 } });

  // Mock API responses
  await page.route('**/portaldeloterias/api/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        numero: 2700,
        dataApuracao: '10/10/2023',
        listaDezenas: ['01', '02', '03', '04', '05', '06'],
        acumulado: false,
        proximoConcurso: 2701,
        dataProximoConcurso: '13/10/2023',
        valorEstimadoProximoConcurso: 1000000
      })
    });
  });

  await page.route('/api/predict', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: JSON.stringify({
          numbers: ['10', '20', '30', '40', '50', '60'],
          message: 'The stars say yes.'
        })
      })
    });
  });

  try {
    // Navigate to the app
    await page.goto('http://localhost:3000');

    // Wait for the AI section to load
    await page.waitForSelector('text="Palpite Místico da IA ✨"');

    // Click 'Gerar Palpite Inteligente'
    await page.click('text="Gerar Palpite Inteligente"');

    // Wait for the prediction to appear
    await page.waitForSelector('text="The stars say yes."');

    // Check if the 'Jogar Agora' button is visible
    const jogarAgoraButton = page.getByRole('button', { name: 'Jogar com estes números' });
    await expect(jogarAgoraButton).toBeVisible();

    // Take a screenshot of the prediction section
    await page.screenshot({ path: 'verification/ai_prediction_button.png' });

    // Click 'Jogar Agora'
    await jogarAgoraButton.click();

    // Verify it switched to the 'games' tab
    await expect(page.getByRole('tab', { name: 'Meus Jogos' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#panel-games')).toBeVisible();

    // Take a screenshot of the games tab
    await page.screenshot({ path: 'verification/games_tab_after_click.png' });

    console.log("Verification successful!");
  } catch (error) {
    console.error("Verification failed:", error);
  } finally {
    await browser.close();
  }
})();
