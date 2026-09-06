import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { generateReflectionTurn, generateStructuredSummary } from './server/geminiService';
import { requireAuth } from './server/authMiddleware';

dotenv.config();

const app = express();
// Cloud Run provides the PORT environment variable (default 8080).
// Inside the AI Studio dev container, the Nginx reverse proxy routes exclusively to 3000.
const PORT = process.env.APPLET_ID ? 3000 : parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '1mb' }));

// Health Check (Public, does not require authentication)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'Mantavya AI Reflection Engine',
    timestamp: new Date().toISOString(),
  });
});

// Reflect Endpoint (Protected by Firebase ID Token)
app.post('/api/reflect', requireAuth, async (req: Request, res: Response) => {
  try {
    const { mode, messages, currentInput } = req.body;

    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Unauthorized user identity.' });
    }

    if (!mode || typeof currentInput !== 'string') {
      return res.status(400).json({ error: 'Invalid input. Mode and currentInput are required.' });
    }

    if (currentInput.trim().length === 0) {
      return res.status(400).json({ error: 'Reflection input cannot be empty.' });
    }

    if (currentInput.length > 8000) {
      return res.status(400).json({ error: 'Input exceeds maximum allowed size of 8000 characters.' });
    }

    const safeMessages: Array<{ role: 'user' | 'assistant'; content: string }> = Array.isArray(messages)
      ? messages.slice(-15).map((m: any) => ({
          role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: typeof m.content === 'string' ? m.content.slice(0, 5000) : '',
        }))
      : [];

    const result = await generateReflectionTurn({
      mode,
      messages: safeMessages,
      currentInput: currentInput.trim(),
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Server error during reflection turn processing:', error.message || 'Unknown reflection error');
    return res.status(500).json({
      error: 'Unable to process reflection at this time.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// Structured Summary Endpoint (Protected by Firebase ID Token)
app.post('/api/summarize', requireAuth, async (req: Request, res: Response) => {
  try {
    const { messages, mode } = req.body;

    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Unauthorized user identity.' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'A conversation transcript is required to generate a structured summary.' });
    }

    const safeMessages: Array<{ role: 'user' | 'assistant'; content: string }> = messages.slice(-25).map((m: any) => ({
      role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: typeof m.content === 'string' ? m.content.slice(0, 5000) : '',
    }));

    const summary = await generateStructuredSummary(safeMessages, mode || 'understand');
    return res.json(summary);
  } catch (error: any) {
    console.error('Server error during summary synthesis:', error.message || 'Unknown summary error');
    return res.status(500).json({
      error: 'Failed to generate structured summary.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mantavya server is listening on port ${PORT}`);
  });
}

startServer();
