# WellEarned Demo Video Script
## Duration: 2-3 minutes

### Pre-Recording Setup
1. Clear AsyncStorage to show fresh onboarding: `AsyncStorage.clear()`
2. Have sample data ready (use onboarding "Get Started with Sample Data")
3. Connect wallet in Profile before recording rewards section
4. Ensure wallet has SOL for tx fees (airdrop if needed)
5. Log at least 2 activities today before recording rewards claim
6. Have the dev API server running (`npm run dev:api`)

---

### Scene 1: Hook (0:00-0:15)
**Show**: App icon / splash screen

**Narration**: "What if your health app actually paid you to be healthy — and proved it on-chain? Meet WellEarned — an AI health coach powered by Gemini that verifies your real behavior on Solana before rewarding you with crypto."

---

### Scene 2: Onboarding (0:15-0:30)
**Show**: Swipe through 3 onboarding slides, then tap "Try Demo as Guest"

**Narration**: "No sign-up needed. One tap and you're in with sample data pre-loaded. WellEarned combines multimodal AI analysis with on-chain activity verification and token rewards."

---

### Scene 3: Home Screen (0:30-0:50)
**Show**: Home screen with stats, daily checklist, AI daily tip

**Narration**: "Your home dashboard shows today's progress. The AI generates a personalized daily wellness tip based on your recent data. Log at least 2 of 3 activities to unlock your daily reward — and all 3 on 3 days per week to activate streak multipliers."

**Action**: Scroll to show the AI Coach section, tap a suggestion chip

---

### Scene 4: AI Chat Coach (0:50-1:10)
**Show**: Chat streaming response with tool call indicator

**Narration**: "The AI coach uses Gemini Pro with streaming and function calling. It has full access to your wellness data — referencing your actual meals, workouts, and mood scores to give personalized advice, not generic tips."

**Action**: Tap "How is my nutrition this week?" — show tool call indicator, then streaming response

---

### Scene 5: Meal Analysis (1:10-1:30)
**Show**: Navigate to Capture Lab > Meal tab, take/upload a photo, tap Analyze

**Narration**: "Snap a photo of any meal. Gemini Flash analyzes the image and returns structured JSON — calories, macros, health score, and healthier alternatives. This meal is also logged on Solana with a SHA-256 content hash for verifiability."

**Action**: Show the nutrition grid and healthier swaps, then point out "saved on-chain" in console/UI

---

### Scene 6: Workout Coach (1:30-1:45)
**Show**: Navigate to Workout tab, show a recorded workout analysis

**Narration**: "Record a workout video for AI form analysis. Gemini detects the exercise, scores your form, flags injury risks, and gives corrections. Like meals, every workout is hashed and logged on Solana."

---

### Scene 7: Mood Tracker (1:45-2:00)
**Show**: Navigate to Mood tab, record a short voice memo, analyze

**Narration**: "Voice your feelings — literally. Gemini analyzes your voice to detect emotions, score your mood, and offer personalized wellness tips. That's 3 activities logged today, all verified on-chain."

---

### Scene 8: Rewards + On-Chain Verification (2:00-2:30)
**Show**: Navigate to Rewards screen

**Narration**: "Here's where Solana makes this more than a regular health app. The Rewards screen shows today's logged activities — you need at least 2 to claim. Our Anchor program on devnet verifies the activity PDAs exist before releasing any reward."

**Action**: Point out the key UI elements in order:
1. **Today section** — show "2/2 required" or "3/2 required" with checkmarks
2. **Multiplier Status card** — show the progress bar: "X/3 active days this week"
   - "Log all 3 activities on 3+ days per week to activate streak multipliers — enforced client-side, verified on-chain"
3. **Claim button** — tap to claim
   - "Every claim is an Anchor instruction. The program checks that at least 2 activity PDAs — meal, workout, or mood — exist for today on-chain. No activities, no reward."
4. **On-Chain Activity stats** — show totalMeals/totalWorkouts/totalMoods from chain
5. **On-Chain Claims** — show transaction with Explorer link
6. Tap Explorer link — show real Solana transaction in browser

---

### Scene 9: Insights (2:30-2:45)
**Show**: Navigate to Insights, show mood chart, generate AI insights

**Narration**: "Cross-feature AI insights find patterns you'd never notice. How does nutrition affect your mood? Where do you perform best? Gemini Pro analyzes 14 days of combined data to connect the dots."

---

### Scene 10: Closing (2:45-3:00)
**Show**: Profile screen with wallet connected, then WellEarned logo

**Narration**: "WellEarned is a real Anchor program on Solana devnet — not just memo transactions. Type-specific PDAs for meals, workouts, and moods. On-chain claim verification requiring proof of activity. SHA-256 content hashing for data integrity. And smart multiplier gating that rewards consistency. Build habits, prove them on-chain, earn crypto."

---

### Key Technical Points to Emphasize
- **On-chain claim verification**: Anchor program checks activity PDAs exist before allowing reward claims
- **Type-specific PDAs**: `[b"meal", authority, day]`, `[b"workout", authority, day]`, `[b"mood", authority, day]`
- **SHA-256 content hashing**: Activity data is hashed and stored on-chain for verifiability
- **2-activity minimum**: Can't game the system by claiming without logging
- **Multiplier gating**: 3 full days per week required to unlock streak bonuses (1.5x/2x/3x)
- **Non-blocking dual-write**: Firestore for speed, Solana for verification — activities log to both
- **6 Gemini capabilities**: Vision, video, audio NLU, streaming, function calling, structured output

### Recording Tips
- Use Android Studio screen recorder or `scrcpy` for high quality
- Keep transitions smooth — don't rush
- Pre-warm the Gemini API (send a test query before recording)
- Make sure wallet is connected and has SOL before Rewards section
- Log 2+ activities before recording the claim flow
- Show the Solana Explorer link opening in browser — this proves it's real
- Highlight the multiplier progress bar — it's a visual differentiator
