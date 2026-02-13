import http from 'http';
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from 'url';

export const server = http.createServer(async (req, res) => {
  // O servidor utiliza a chave de API das variáveis de ambiente
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  // Configuração básica de CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/predict' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        let params;
        try {
          params = JSON.parse(body);
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "JSON inválido." }));
          return;
        }

        const { name, betLength, balls } = params;

        // Validação de entrada
        if (typeof name !== 'string' || name.length === 0 || name.length > 50) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Parâmetro 'name' inválido. Deve ser uma string de 1 a 50 caracteres." }));
          return;
        }

        if (!Number.isInteger(betLength) || betLength < 1 || betLength > 50) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Parâmetro 'betLength' inválido. Deve ser um número inteiro entre 1 e 50." }));
          return;
        }

        if (!Number.isInteger(balls) || balls < 1 || balls > 100) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Parâmetro 'balls' inválido. Deve ser um número inteiro entre 1 e 100." }));
          return;
        }

        if (betLength > balls) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "O número de dezenas (betLength) não pode ser maior que o total de bolas (balls)." }));
          return;
        }

        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Chave de API não configurada no servidor." }));
          return;
        }

        // Inicializa a IA no servidor, mantendo a chave protegida
        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-3-flash-preview";

        const prompt = `
          Atue como um especialista em análise combinatória e sorte.
          Gere um palpite para a loteria ${name}.
          Eu preciso de ${betLength} números distintos entre 1 e ${balls}.

          Responda APENAS com este JSON exato, sem markdown:
          {
            "numbers": ["01", "02", ...],
            "message": "Uma frase curta e mística sobre sorte e prosperidade"
          }
        `;

        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        // Retorna o texto gerado pela IA (espera-se um JSON string)
        res.end(JSON.stringify({ text: response.text }));
      } catch (error) {
        console.error("Erro no processamento da IA:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 3001;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`Servidor de backend rodando na porta ${PORT}`);
  });
}
