# WellEarned — Demo Script (3 minutes)

## 0:00-0:15 — Hook

> "What if your health app actually paid you to be healthy — and proved it on-chain? Meet WellEarned, an AI health coach powered by Gemini that verifies your real behavior on Solana before rewarding you with crypto."

## 0:15-0:30 — Zero-Friction Demo Mode

> "No sign-up needed. One tap on 'Try Demo as Guest' and you're in with sample data pre-loaded."

**Actions:**
- Show auth screen with prominent guest demo button
- Tap "Try Demo as Guest" — instant anonymous auth, dashboard loads

## 0:30-1:00 — Meal Analyzer (Vision + Structured Output + On-Chain)

> "Snap a photo of any meal. Gemini Flash analyzes the image and returns structured JSON — calories, macros, health score, and healthier alternatives. Behind the scenes, the meal is also logged on Solana with a SHA-256 content hash for verifiability."

**Actions:**
- Upload meal photo
- Show loading, then NutritionCard result
- Highlight: schema-enforced JSON, on-chain logging

## 1:00-1:40 — Live Webcam Workout Coach (Real-Time Vision + On-Chain)

> "Turn on your camera and Gemini analyzes your form in real-time — every 5 seconds, a frame goes to Gemini Flash. You get a live form score, rep counter, and correction tips. The workout summary is hashed and logged on Solana alongside Firestore."

**Actions:**
- Navigate to Workout Coach
- Record a short workout, show form analysis
- Emphasize: dual-write to Firestore + Solana

## 1:40-2:00 — Mood Tracker (Audio NLU + On-Chain)

> "Voice your feelings. Gemini analyzes your voice to detect emotions and mood score. That's all 3 activities logged — each one verified on Solana with its own PDA."

**Actions:**
- Show mood analysis result
- Highlight: 3 separate on-chain PDAs — meal, workout, mood

## 2:00-2:30 — Rewards + On-Chain Claim Verification

> "Here's where Solana makes this real. You need at least 2 activities logged today to claim. Our Anchor program checks that the activity PDAs actually exist on-chain before releasing any reward. No activities, no tokens."

**Actions:**
- Show Rewards screen with "2/2 required" on Today section
- Show Multiplier Status card: "3 active days per week needed to unlock streak multipliers — 1.5x, 2x, up to 3x"
- Tap Claim button — show "Verifying on-chain..." state
- Show successful claim with transaction signature
- Show On-Chain Activity stats (totalMeals, totalWorkouts, totalMoods from chain)
- Tap Explorer link — open real Solana transaction in browser

## 2:30-2:50 — AI Insights + Chat Coach

> "Gemini Pro analyzes 14 days of combined data to find patterns — like 'your mood is higher on days you exercise.' The chat coach uses function calling to reference your actual logged data, not generic advice."

**Actions:**
- Show Insights screen with cross-feature analysis
- Quick chat demo with tool call indicator

## 2:50-3:00 — Closing

> "A real Anchor program on Solana devnet. Type-specific PDAs. On-chain claim verification. SHA-256 content hashing. Smart multiplier gating. Six Gemini capabilities. WellEarned — build habits, prove them on-chain, earn crypto."

**Actions:**
- Quick montage: activity logging, on-chain verification, claim, explorer
- End on WellEarned logo
