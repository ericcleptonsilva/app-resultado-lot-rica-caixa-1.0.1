import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { server } from './server.js';
import http from 'http';

describe('Server API Key Handling', () => {
  let port;

  before(async () => {
    // Start server on a random port
    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        resolve();
      });
    });
  });

  after(() => {
    server.close();
  });

  test('returns 500 when API key is missing', async () => {
    // Save original environment variables
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    const originalApiKey = process.env.API_KEY;

    // Unset API keys
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;

    try {
      const postData = JSON.stringify({
        name: 'Mega-Sena',
        betLength: 6,
        balls: 60
      });

      const options = {
        hostname: 'localhost',
        port: port,
        path: '/api/predict',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            resolve({
              statusCode: res.statusCode,
              body: data
            });
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      assert.strictEqual(response.statusCode, 500, 'Status code should be 500');

      const body = JSON.parse(response.body);
      assert.strictEqual(body.error, "Chave de API não configurada no servidor.", 'Error message should match');

    } finally {
      // Restore environment variables
      if (originalGeminiKey !== undefined) process.env.GEMINI_API_KEY = originalGeminiKey;
      if (originalApiKey !== undefined) process.env.API_KEY = originalApiKey;
    }
  });
});
