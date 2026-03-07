export const MEAL_SCHEMA = {
  type: 'object',
  properties: {
    meal_name: { type: 'string' },
    ingredients: { type: 'array', items: { type: 'string' } },
    nutrition: {
      type: 'object',
      properties: {
        calories: { type: 'number' },
        protein_g: { type: 'number' },
        carbs_g: { type: 'number' },
        fat_g: { type: 'number' },
        fiber_g: { type: 'number' },
      },
      required: ['calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g'],
    },
    health_score: { type: 'number' },
    health_notes: { type: 'string' },
    healthier_swaps: { type: 'array', items: { type: 'string' } },
    recipe_suggestion: { type: 'string' },
  },
  required: ['meal_name', 'ingredients', 'nutrition', 'health_score', 'health_notes', 'healthier_swaps', 'recipe_suggestion'],
};

export const WORKOUT_SCHEMA = {
  type: 'object',
  properties: {
    exercise_detected: { type: 'string' },
    reps_counted: { type: 'number', nullable: true },
    form_score: { type: 'number' },
    form_feedback: { type: 'array', items: { type: 'string' } },
    corrections: { type: 'array', items: { type: 'string' } },
    injury_risk: { type: 'string', enum: ['low', 'medium', 'high'] },
    next_workout_suggestion: { type: 'string' },
    encouragement: { type: 'string' },
  },
  required: ['exercise_detected', 'form_score', 'form_feedback', 'corrections', 'injury_risk', 'next_workout_suggestion', 'encouragement'],
};

export const MOOD_SCHEMA = {
  type: 'object',
  properties: {
    mood_score: { type: 'number' },
    mood_category: { type: 'string', enum: ['great', 'good', 'okay', 'low', 'bad'] },
    energy_level: { type: 'string', enum: ['high', 'medium', 'low'] },
    emotions_detected: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    wellness_tip: { type: 'string' },
    affirmation: { type: 'string' },
  },
  required: ['mood_score', 'mood_category', 'energy_level', 'emotions_detected', 'summary', 'wellness_tip', 'affirmation'],
};

export const INSIGHTS_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      type: { type: 'string', enum: ['positive', 'neutral', 'attention'] },
    },
    required: ['title', 'description', 'type'],
  },
};
