import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

function getGeminiClient() {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
    ''
  if (!apiKey) return null
  return new GoogleGenerativeAI(apiKey)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const genAI = getGeminiClient()
    if (!genAI) {
      return res.status(500).json({ error: 'API key not found. Set GEMINI_API_KEY in your environment.' })
    }

    const { prompt, fileParts, model, generationConfig, tools } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    const modelConfig = { model: model || 'gemini-3-flash-preview' }
    if (tools) modelConfig.tools = tools

    const geminiModel = genAI.getGenerativeModel(modelConfig)

    const parts = [...(fileParts || []), { text: prompt }]
    const requestOptions = {}
    if (generationConfig) requestOptions.generationConfig = generationConfig

    const result = await geminiModel.generateContent({ contents: [{ parts }], ...requestOptions })
    const response = result.response
    const text = response.text()
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null

    const body = { text }
    if (groundingMetadata) body.groundingMetadata = groundingMetadata

    res.status(200).json(body)
  } catch (err) {
    console.error('Gemini API error:', err)
    const msg = err.message || ''
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return res.status(429).json({ error: 'AI is a bit busy right now. Please wait a moment and try again.' })
    }
    res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
