import { test, expect, chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1024 } });

  await page.route('**/portaldeloterias/api/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        numero: 2600,
        dataApuracao: "20/06/2023",
        listaDezenas: ["01", "02", "03", "04", "05", "06"],
        acumulado: false,
        proximoConcurso: 2601,
        dataProximoConcurso: "24/06/2023"
      })
    });
  });

  await page.route('**/api/predict', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: JSON.stringify({
          numbers: ["10", "20", "30", "40", "50", "60"],
          message: "Teste de Palpite."
        })
      })
    });
  });

  console.log("Navigating...");
  await page.goto('http://localhost:3000');

  console.log("Waiting for Resultado tab...");
  await page.locator('#panel-results').waitFor();

  console.log("Clicking Gerar Palpite...");
  await page.getByRole('button', { name: 'Gerar Palpite Inteligente' }).click();

  console.log("Waiting for Jogar Agora button...");
  await page.getByRole('button', { name: 'Jogar Agora' }).waitFor();

  console.log("Taking screenshot of AI result...");
  await page.screenshot({ path: '/app/verification-ai.png' });

  console.log("Clicking Jogar Agora...");
  await page.getByRole('button', { name: 'Jogar Agora' }).click();

  console.log("Waiting for Meus Jogos tab to be active...");
  await expect(page.locator('#tab-games')).toHaveAttribute('aria-selected', 'true');

  console.log("Waiting for games panel...");
  await page.locator('#panel-games').waitFor();

  console.log("Taking screenshot of selected games grid...");
  await page.screenshot({ path: '/app/verification-games.png' });

  await browser.close();
  console.log("Done.");
})();
