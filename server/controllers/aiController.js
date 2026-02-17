const aiService = require('../services/aiService');

const conversationStore = new Map();

async function handleChat(req, res) {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId are required' });
    }

    if (!conversationStore.has(sessionId)) {
      conversationStore.set(sessionId, []);
    }

    const history = conversationStore.get(sessionId);
    history.push({ role: 'user', content: message });

    const result = await aiService.chat(history);

    history.push({ role: 'assistant', content: result.message });
    conversationStore.set(sessionId, history);

    res.json({
      message: result.message,
      isComplete: result.isComplete,
      extractedData: result.extractedData,
      sessionId,
    });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
}

async function getRecommendation(req, res) {
  try {
    const projectDetails = req.body;

    if (!projectDetails.propertyType || !projectDetails.carpetArea) {
      return res.status(400).json({ error: 'Project details are required' });
    }

    const recommendation = await aiService.getDesignRecommendation(projectDetails);

    res.json({ recommendation });
  } catch (error) {
    console.error('AI Recommendation Error:', error.message);
    res.status(500).json({ error: 'Failed to generate recommendation' });
  }
}

function clearSession(req, res) {
  const { sessionId } = req.body;
  if (sessionId) {
    conversationStore.delete(sessionId);
  }
  res.json({ success: true });
}

module.exports = { handleChat, getRecommendation, clearSession };
