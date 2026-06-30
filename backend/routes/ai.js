const router = require('express').Router();
const ai = require('../services/aiService');
const { authMiddleware } = require('../middleware/auth');

// GET /api/ai/leak-detection/:nodeId
router.get('/leak-detection/:nodeId', async (req, res) => {
  try {
    const result = await ai.detectLeak(req.params.nodeId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/leak-detection - system-wide
router.get('/leak-detection', async (req, res) => {
  try {
    const result = await ai.detectLeaksSystemWide();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/forecast/:nodeId?days=7
router.get('/forecast/:nodeId', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const result = await ai.forecastConsumption(req.params.nodeId, days);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/anomalies/:nodeId
router.get('/anomalies/:nodeId', async (req, res) => {
  try {
    const result = await ai.detectAnomalies(req.params.nodeId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/recommendations/:nodeId
router.get('/recommendations/:nodeId', async (req, res) => {
  try {
    const result = await ai.getRecommendations(req.params.nodeId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/insights - system-wide overview for AI dashboard
router.get('/insights', async (req, res) => {
  try {
    const result = await ai.systemInsights();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat - { message: string }
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'message is required' });
    const result = await ai.chatAssistant(message.trim());
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
