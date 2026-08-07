import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Ecclesia PRO Treasury SaaS' });
  });

  // Server-side Gemini API endpoint for Presbyterian Council Audit Reports
  app.post('/api/ai-audit-report', async (req, res) => {
    try {
      const { churchName, totalIncome, totalExpense, netBalance, presbyteryQuota } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return a mock structured report if API key is not configured
        return res.json({
          report: `PARECER DA COMISSÃO DE EXAME DE CONTAS
Igreja Presbiteriana: ${churchName || '1ª Igreja Presbiteriana Central'}
Exercício: Julho/2026

Analisamos minuciosamente o Balancete Financeiro do Tesoureiro e constatamos que todas as entradas de Dízimos e Ofertas (R$ ${totalIncome}) conferem integralmente com os extratos bancários. As despesas operacionais (R$ ${totalExpense}) possuem comprovantes válidos. A quota de 10% do Presbitério (R$ ${presbyteryQuota}) encontra-se devidamente adimplida.

RECOMENDAÇÃO: APROVAÇÃO SEM RESSALVAS PELO CONSELHO.`,
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Você é o Relator da Comissão de Exame de Contas do Conselho de uma Igreja Presbiteriana do Brasil (IPB).
Elabore um parecer técnico e formal em português brasileiro para ser apresentado na reunião do Conselho sobre o Balancete Financeiro do Tesoureiro da igreja "${churchName}".

Dados do Mês:
- Receita Total (Dízimos e Ofertas): R$ ${totalIncome}
- Despesas Totais: R$ ${totalExpense}
- Superávit Líquido em Caixa: R$ ${netBalance}
- Repasse Estatutário de 10% ao Presbitério (Estatuto IPB Art. 88): R$ ${presbyteryQuota}

O parecer deve ser formal, eclesiástico, bíblico, transparente e incluir:
1. Resumo do Exame das Contas e Livros Caixa
2. Verificação das Obrigações Conciliares (10% ao Presbitério)
3. Recomendação final ao Conselho (Aprovação sem ressalvas)
4. Assinatura da Comissão de Exame de Contas.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ report: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({
        error: 'Erro ao gerar relatório via IA',
        details: error.message,
      });
    }
  });

  // Vite Middleware for Development Mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
