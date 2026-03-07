# WellEarned State Design

## Purpose
Create a mobile-first wellness app with clear authentication, persistent sessions, and high-feedback interaction flows.

## Entry / Exit
- Entry: App launch
- Exit success: User lands on Home dashboard with active session

## Core State Domains
1. Auth State
- `loading`: auth bootstrap in progress
- `user`: authenticated Firebase user or null
- `mode`: sign-in or sign-up for first-time users
- `error`: auth error string

2. Wellness Data State
- Collections: `meals`, `workouts`, `moods`
- Source: Firestore `users/{uid}/{collection}`
- Derived: streaks, daily completion, reward eligibility, insight payload

3. AI State
- Requests for meal/workout/mood/insights/chat
- Common request state: `idle | loading | success | error`
- Error surface should always remain inline and non-fatal

4. Wallet State
- `walletAddress`, `balance`, `connecting`
- Used for rewards claims and profile status

## Navigation State
- Unauthenticated: `AuthScreen` only
- Authenticated: bottom tabs (`Home`, `Log`, `Rewards`, `Insights`, `Profile`)
- In-tab local mode switches for Log (Meal/Workout/Mood)

## UX States per Critical Flow
- Auth: loading, invalid credentials, weak password, account exists, offline
- Home: empty wellness data, populated, fetch error fallback
- Insights: no data, loading, API error, success
- Rewards: not eligible, eligible, claiming, claim result

## Persistence Rules
- Firebase Auth must use React Native persistence via AsyncStorage
- Returning users skip auth screen automatically when session exists
- First-time users see login/signup screen

## Guardrails
- No flow should crash app on remote errors
- All AI + Firestore failures should render inline recovery UI
- Empty states must provide an immediate next action
