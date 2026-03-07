# Gemini 3 Integration Summary

WellEarned is an AI-powered wellness app that leverages six distinct capabilities of Google's Gemini 3 API across every core feature.

**1. Multimodal Vision (Meal Analysis)** — Users photograph meals and Gemini 3 Flash's vision model identifies ingredients, estimates calories and macronutrients, scores nutritional quality, and suggests healthier alternatives, all from a single image with structured JSON output.

**2. Video Understanding (Workout Coaching)** — Short exercise clips are processed by extracting frames and sending them to Gemini 3 Flash to detect exercises, count reps, evaluate form on a 1-10 scale, flag injury risks, and provide specific corrections. Live webcam mode analyzes frames every 5 seconds for real-time coaching.

**3. Audio NLU (Mood Analysis)** — Voice memos are analyzed using Gemini 3 Flash's audio understanding to detect emotions, categorize mood and energy levels, and generate personalized wellness tips and affirmations. Text journal entries are also supported.

**4. Streaming + Function Calling (Chat Coach)** — A real-time conversational coach uses Gemini 3 Pro's streaming text generation with function calling. The model invokes tools to query the user's actual meals, workouts, and moods from Firestore, then delivers personalized advice referencing real data. Google Search grounding provides cited sources for health-related queries.

**5. Structured Output (All Features)** — Every AI analysis endpoint uses Gemini 3's `responseMimeType: 'application/json'` with `responseSchema` to guarantee valid, schema-conformant JSON responses. This eliminates fragile regex/JSON parsing and ensures reliable data flow from AI to UI.

**6. Cross-Feature Reasoning (AI Insights)** — Gemini 3 Pro analyzes 14 days of combined data across all three tracking domains (meals, workouts, moods) to identify patterns and correlations (e.g., "your mood scores are higher on days you exercise"), surfacing actionable insights users would miss on their own.

## Model Assignment

| Feature | Model | Key Capabilities |
|---------|-------|-----------------|
| Meal Analysis | Flash | Vision + Structured Output |
| Workout Analysis | Flash | Video Understanding + Structured Output |
| Live Webcam Coaching | Flash | Real-time Vision + Structured Output |
| Mood Analysis | Flash | Audio NLU + Structured Output |
| Daily Tip | Flash | Text Generation |
| Chat Coach | **Pro** | Streaming + Function Calling + Grounding |
| AI Insights | **Pro** | Cross-Feature Reasoning + Structured Output |
| Weekly Summary | **Pro** | Cross-Feature Reasoning + Structured Output |

All features are accessible in demo mode without authentication, making the full Gemini 3 integration immediately explorable.
