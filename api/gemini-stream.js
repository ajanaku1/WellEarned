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

    const { history, systemPrompt, model, tools, toolContext, generationConfig } = req.body

    const modelConfig = { model: model || 'gemini-3-flash-preview' }
    if (tools) modelConfig.tools = tools

    const geminiModel = genAI.getGenerativeModel(modelConfig)

    const chatConfig = {
      history: (history || []).slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
      systemInstruction: { parts: [{ text: systemPrompt }] },
    }
    if (generationConfig) chatConfig.generationConfig = generationConfig

    const chat = geminiModel.startChat(chatConfig)

    const lastUserMsg = history?.[history.length - 1]?.text || ''

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    let result = await chat.sendMessageStream(lastUserMsg)

    // Function calling resolution loop
    const MAX_TOOL_ROUNDS = 3
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      let fullResponse = ''
      let functionCalls = []

      for await (const chunk of result.stream) {
        const parts = chunk.candidates?.[0]?.content?.parts || []
        for (const part of parts) {
          if (part.text) {
            fullResponse += part.text
            res.write(`data: ${JSON.stringify({ text: part.text })}\n\n`)
          }
          if (part.functionCall) {
            functionCalls.push(part.functionCall)
          }
        }
      }

      // Check for grounding metadata
      const response = await result.response
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata
      if (groundingMetadata) {
        res.write(`data: ${JSON.stringify({ groundingMetadata })}\n\n`)
      }

      // If no function calls, we're done
      if (functionCalls.length === 0) break

      // Resolve function calls
      if (toolContext) {
        for (const fc of functionCalls) {
          res.write(`data: ${JSON.stringify({ toolCall: { name: fc.name, args: fc.args } })}\n\n`)

          const resolver = toolContext[fc.name]
          const fnResult = resolver ? resolver(fc.args || {}) : { error: `Unknown function: ${fc.name}` }

          // Send function response back to the model
          result = await chat.sendMessageStream([{
            functionResponse: {
              name: fc.name,
              response: fnResult,
            },
          }])
        }
      } else {
        break
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (err) {
    console.error('Gemini stream error:', err)
    const msg = err.message || ''
    let friendly
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      friendly = 'AI is a bit busy right now. Please wait a moment and try again.'
    } else if (msg.includes('API_KEY') || msg.includes('apiKey')) {
      friendly = 'API key configuration issue. Please check GEMINI_API_KEY.'
    } else if (msg.includes('not found') || msg.includes('404')) {
      friendly = 'AI model not available. Please check the model name.'
    } else {
      friendly = msg || 'Something went wrong. Please try again.'
    }
    if (!res.headersSent) {
      res.status(msg.includes('429') ? 429 : 500).json({ error: friendly })
    } else {
      res.write(`data: ${JSON.stringify({ error: friendly })}\n\n`)
      res.end()
    }
  }
}
