# WellEarned

**The first AI health coach that pays you to be healthy.**

WellEarned combines multimodal Gemini AI coaching with real Solana blockchain rewards. Log meals, workouts, and moods daily — earn SKR tokens on-chain. Built for the Solana Mobile MONOLITH Hackathon 2026.

---

## Demo

https://github.com/user-attachments/assets/demo-placeholder

> Snap a meal photo. Record a workout. Voice your mood. Claim crypto rewards on Solana. All powered by Gemini AI.

| Home Dashboard | AI Meal Analysis | Workout Coach | Mood Tracker |
|:-:|:-:|:-:|:-:|
| Daily tips, progress checklist, AI chat | Photo → nutrition breakdown + health score | Video → form scoring + injury risk | Voice/text → emotion detection + wellness tips |

| Rewards | Insights | Chat Coach | Profile |
|:-:|:-:|:-:|:-:|
| On-chain claims, streak multipliers | Mood charts, movement map, AI patterns | Streaming chat with tool calling | Wallet, balances, SMS status |

---

## What It Does

1. **Meal Analysis** — Snap a photo, Gemini Vision identifies ingredients, estimates macros, scores nutrition 1-10, suggests healthier swaps
2. **Workout Coach** — Record a video, Gemini analyzes form, counts reps, flags injury risk, gives corrections
3. **Mood Tracker** — Voice a memo or journal, Gemini detects emotions, scores mood, provides affirmations
4. **AI Chat Coach** — Streaming conversation with tool calling that references your actual meals, workouts, and mood data
5. **Daily Tips & Weekly Summaries** — Personalized AI-generated wellness guidance
6. **Cross-Feature Insights** — AI finds patterns across nutrition, exercise, and emotional data
7. **Crypto Rewards** — Complete all 3 daily check-ins → claim SKR tokens on Solana. Streaks multiply rewards up to 3x

---

## Solana Integration

| Feature | Implementation |
|---------|---------------|
| Wallet Connection | Mobile Wallet Adapter (MWA) with demo keypair fallback |
| Reward Claims | Real on-chain transactions via Memo Program + SPL token transfer |
| SKR Token | SPL token ([`CxAyTrF99D9sZ7sE9638ANU41Vdpv9j7LSShDbhxnJuN`](https://explorer.solana.com/address/CxAyTrF99D9sZ7sE9638ANU41Vdpv9j7LSShDbhxnJuN?cluster=devnet)) on devnet |
| Verification | Every claim visible on [Solana Explorer](https://explorer.solana.com/?cluster=devnet) |
| Streak Multipliers | 7d = 1.5x, 14d = 2x, 30d = 3x rewards |
| On-Chain Program | Anchor-based reward PDA system [`En9N1SXMDqCv7CkVV7ePq2AEjeJwXJofUYzZqgwR2Xk1`](https://explorer.solana.com/address/En9N1SXMDqCv7CkVV7ePq2AEjeJwXJofUYzZqgwR2Xk1?cluster=devnet) ([source](./programs/wellearned-rewards/)) |
| SMS Capabilities | MWA detection, Seed Vault awareness, dApp Store ready |

**Reward Pool Wallet:** [`229cvD8WSWJfWmnJwY2kZqUKi82uz4cf6zyeCVitMVRB`](https://explorer.solana.com/address/229cvD8WSWJfWmnJwY2kZqUKi82uz4cf6zyeCVitMVRB?cluster=devnet)

---

## Gemini AI Integration

| Modality | Feature | Model | Output |
|----------|---------|-------|--------|
| Image | Meal nutrition analysis | Gemini Flash | Structured JSON (macros, score, swaps) |
| Video | Workout form scoring | Gemini Flash | Structured JSON (form, corrections, risk) |
| Audio | Mood voice analysis | Gemini Flash | Structured JSON (emotions, score, tips) |
| Text | Streaming chat coach | Gemini Pro | Tool-augmented streaming responses |

**Advanced AI Features:**
- 4 tool calls for data-aware coaching (get_recent_meals, workouts, moods, wellness_stats)
- Structured JSON output with enforced schemas on all analysis
- Cross-feature insight generation spanning 14 days of data
- Personalized daily tips + weekly summaries
- Persistent chat history (Firestore-backed)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native + Expo SDK 55 + TypeScript |
| AI Engine | Google Gemini (Flash + Pro) — 4 modalities |
| Blockchain | Solana (web3.js, SPL Token, MWA, Anchor) |
| Backend | Firebase Auth + Firestore (real-time) |
| Auth | Email, Google OAuth, Solana Wallet, Guest |
| Media | expo-camera, expo-av, expo-image-picker |
| Location | expo-location + react-native-maps |
| Feedback | expo-haptics on all key interactions |
| Security | expo-secure-store for keypair storage |

---

## Architecture

```
User Device (Seeker / Android)
  |
  +-- React Native + Expo SDK 55
  |     +-- Home (dashboard, daily tip, AI chat)
  |     +-- Capture Lab (meal photo / workout video / mood voice)
  |     +-- Insights (charts, map, AI patterns)
  |     +-- Rewards (on-chain claims, streak tracking)
  |     +-- Profile (wallet, balances, SMS status)
  |
  +-- Gemini AI
  |     +-- Flash: image/video/audio analysis (structured JSON)
  |     +-- Pro: streaming chat with 4 tool calls
  |
  +-- Solana Blockchain
  |     +-- MWA (Mobile Wallet Adapter)
  |     +-- Memo Program (verifiable claim records)
  |     +-- SPL Token (SKR transfer on claim)
  |     +-- Anchor Program (PDA reward accounts)
  |
  +-- Firebase
        +-- Auth (email, Google, wallet, anonymous)
        +-- Firestore (meals, workouts, moods, chat, claims)
```

---

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Fill in Firebase, Gemini, and Solana config

# Run on Android
npx expo run:android
```

### Required Environment Variables
- `EXPO_PUBLIC_FIREBASE_*` — Firebase project config
- `GEMINI_API_KEY` — Google Gemini API key
- `SOLANA_NETWORK` — `devnet` or `mainnet-beta`
- `SKR_TOKEN_MINT` — SPL token mint address
- `REWARD_POOL_WALLET` — Token reward pool address

---

## Screens

| Screen | Description |
|--------|-------------|
| Auth | Email, Google, Wallet, Guest sign-in |
| Onboarding | 3-slide intro + sample data seeding |
| Home | Stats, daily tip, progress checklist, AI chat |
| Capture Lab | Tabs: Meal (photo), Workout (video), Mood (voice/text) |
| Chat Coach | Full-screen AI coach with tool calling |
| Insights | Mood chart, movement map, streak, AI insights |
| Rewards | Claim SKR, streak grid, on-chain history |
| Profile | Wallet, balances, SMS status, settings |

---

## Hackathon

Built for **Solana Mobile MONOLITH Hackathon 2026**.

Category: Health + DeFi + AI

See [Pitch Deck](./pitch/PITCH_DECK.md) | [Demo Script](./pitch/DEMO_SCRIPT.md) | [Roadmap](./ROADMAP.md)
