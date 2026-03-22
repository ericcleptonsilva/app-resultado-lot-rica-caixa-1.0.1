const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1024 } });
  const page = await context.newPage();

  // Mock API responses
  await page.route('**/portaldeloterias/api/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        numero: 1234,
        dataApuracao: '01/01/2023',
        listaDezenas: ['01', '02', '03', '04', '05', '06'],
        acumulado: false,
        proximoConcurso: 1235,
        dataProximoConcurso: '08/01/2023',
        valorEstimadoProximoConcurso: 1000000
      })
    });
  });

  await page.route('**/api/predict', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: JSON.stringify({
          numbers: ['42', '13', '07', '21', '55', '38'],
          message: 'The stars shine bright!'
        })
      })
    });
  });

  console.log('Navigating to app...');
  await page.goto('http://localhost:3000');

  // Wait for the results to load
  console.log('Waiting for results tab...');
  await page.waitForSelector('text=CONCURSO 1234');

  // Click Generate AI Prediction
  console.log('Clicking AI predict...');
  await page.click('text=Gerar Palpite Inteligente');

  // Wait for the prediction message
  console.log('Waiting for prediction message...');
  await page.waitForSelector('text=The stars shine bright!');

  // Take a screenshot to show the new button
  await page.screenshot({ path: 'verification/ai_prediction_box.png' });

  // Click 'Jogar Agora'
  console.log('Clicking Jogar Agora...');
  await page.getByRole('button', { name: 'Jogar com estes números' }).click();

  // We expect to be transitioned to 'Meus Jogos'
  console.log('Waiting for games tab...');
  await page.waitForSelector('#panel-games');

  // And the balls should be selected and displayed in the 'selectedNumbers' format
  const selectedText = await page.locator('span', { hasText: '6 / 6' }).textContent();
  console.log('Selection state:', selectedText);

  // Take screenshot of 'Meus Jogos' active tab
  await page.screenshot({ path: 'verification/my_games_active.png' });

  await browser.close();
  console.log('Success!');
})();