export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const DURATION_SECONDS = 150; // 2:30

// Palette.matches app theme
export const C = {
  bg: '#0A0D0B',
  surface: '#0F1210',
  card: '#1C2320',
  brand: '#7BAF8E',
  brandDeep: '#5C8A6A',
  mint: '#8ECFA5',
  lavender: '#A594C9',
  amber: '#D4A76A',
  cyan: '#7BBCC5',
  solana: '#7BD4A3',
  ink: '#F0EDE8',
  inkSoft: '#A8A196',
  inkMuted: '#6B655C',
  danger: '#CF7171',
};

// Scene timings (in seconds) — matched to voiceover durations + 2s padding
export const SCENES = {
  intro: { start: 0, duration: 14 },
  home: { start: 14, duration: 14 },
  aiChat: { start: 28, duration: 14 },
  mealAnalysis: { start: 42, duration: 14 },
  workoutCoach: { start: 56, duration: 13 },
  moodTracker: { start: 69, duration: 12 },
  rewards: { start: 81, duration: 18 },
  insights: { start: 99, duration: 12 },
  closing: { start: 111, duration: 19 },
};

// Scene timings adjusted: rewards gets more time for verification flow
// Voiceover script per scene
export const VOICEOVER: Record<string, string> = {
  intro:
    'What if your health app proved your healthy habits on-chain before paying you? Meet WellEarned — an AI health coach powered by Gemini that verifies your real behavior on Solana before rewarding you with crypto.',
  home:
    'Your home dashboard shows today\'s progress. The AI generates a personalized daily wellness tip. Log at least 2 of 3 activities to unlock your daily reward, and all 3 on 3 days per week to activate streak multipliers.',
  aiChat:
    'The AI coach uses Gemini Pro with streaming and function calling. It has full access to your wellness data, referencing your actual meals, workouts, and mood scores to give personalized advice.',
  mealAnalysis:
    'Snap a photo of any meal. Gemini Flash identifies ingredients, estimates macros, and scores nutrition. Behind the scenes, the meal is hashed with SHA-256 and logged on Solana for verifiability.',
  workoutCoach:
    'Record a workout video for AI form analysis. It detects the exercise, scores your form, and flags injury risks. Like meals, every workout is hashed and logged on-chain with its own PDA.',
  moodTracker:
    'Voice your feelings. The AI analyzes your voice to detect emotions and score your mood. That\'s three activities logged, each verified on Solana with type-specific PDAs.',
  rewards:
    'Here\'s where Solana makes this real. Our Anchor program verifies that at least 2 activity PDAs exist on-chain for today before releasing any reward. Log 3 activities on 3 days per week to activate streak multipliers, up to 3x. No proof of activity, no tokens.',
  insights:
    'Cross-feature AI insights find patterns you\'d never spot. How does nutrition affect your mood? Gemini Pro analyzes 14 days of combined data to connect the dots.',
  closing:
    'A real Anchor program on Solana devnet. Type-specific PDAs for meals, workouts, and moods. On-chain claim verification. SHA-256 content hashing. Smart multiplier gating. Six Gemini capabilities. WellEarned: build habits, prove them on-chain, earn crypto.',
};
