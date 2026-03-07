import { addUserItem } from './firestore';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const sampleMeals = [
  { meal_name: 'Grilled Chicken Salad', ingredients: ['chicken breast', 'mixed greens', 'cherry tomatoes', 'avocado', 'olive oil'], nutrition: { calories: 420, protein_g: 38, carbs_g: 18, fat_g: 22, fiber_g: 8 }, health_score: 9, health_notes: 'Excellent protein-rich meal', healthier_swaps: [], recipe_suggestion: 'Try adding quinoa for extra fiber' },
  { meal_name: 'Overnight Oats', ingredients: ['rolled oats', 'almond milk', 'chia seeds', 'blueberries', 'honey'], nutrition: { calories: 340, protein_g: 12, carbs_g: 52, fat_g: 10, fiber_g: 9 }, health_score: 8, health_notes: 'Great breakfast choice with fiber', healthier_swaps: ['Replace honey with stevia'], recipe_suggestion: 'Add walnuts for omega-3' },
  { meal_name: 'Salmon Bowl', ingredients: ['salmon fillet', 'brown rice', 'edamame', 'cucumber', 'soy sauce'], nutrition: { calories: 520, protein_g: 35, carbs_g: 48, fat_g: 18, fiber_g: 5 }, health_score: 9, health_notes: 'Rich in omega-3 fatty acids', healthier_swaps: ['Use low-sodium soy sauce'], recipe_suggestion: 'Try with cauliflower rice' },
  { meal_name: 'Turkey Wrap', ingredients: ['turkey breast', 'whole wheat tortilla', 'spinach', 'hummus', 'bell pepper'], nutrition: { calories: 380, protein_g: 28, carbs_g: 35, fat_g: 14, fiber_g: 6 }, health_score: 8, health_notes: 'Balanced macro profile', healthier_swaps: [], recipe_suggestion: 'Add avocado for healthy fats' },
  { meal_name: 'Pasta Carbonara', ingredients: ['spaghetti', 'bacon', 'eggs', 'parmesan', 'black pepper'], nutrition: { calories: 680, protein_g: 22, carbs_g: 65, fat_g: 35, fiber_g: 3 }, health_score: 5, health_notes: 'High in saturated fat', healthier_swaps: ['Use turkey bacon', 'Try whole wheat pasta'], recipe_suggestion: 'Add roasted vegetables' },
];

const sampleWorkouts = [
  { exercise_detected: 'Push-ups', form_score: 8, form_feedback: ['Good depth', 'Keep core tight', 'Nice tempo'], corrections: ['Slight elbow flare'], injury_risk: 'low', next_workout_suggestion: 'Try diamond push-ups', encouragement: 'Great form!', workoutType: 'gym', duration: 20 },
  { exercise_detected: 'Morning Run', form_score: 7, form_feedback: ['Steady pace', 'Good stride length'], corrections: ['Land mid-foot not heel'], injury_risk: 'low', next_workout_suggestion: 'Add interval sprints', encouragement: 'Keep it up!', workoutType: 'run', duration: 30, lat: 37.7749, lng: -122.4194 },
  { exercise_detected: 'Yoga Flow', form_score: 9, form_feedback: ['Excellent flexibility', 'Smooth transitions', 'Great breathing'], corrections: [], injury_risk: 'low', next_workout_suggestion: 'Try crow pose', encouragement: 'Beautiful practice!', workoutType: 'yoga', duration: 25 },
  { exercise_detected: 'Squats', form_score: 7, form_feedback: ['Good depth', 'Knees track over toes'], corrections: ['Keep chest up more'], injury_risk: 'low', next_workout_suggestion: 'Add weight gradually', encouragement: 'Strong legs!', workoutType: 'gym', duration: 15 },
];

const sampleMoods = [
  { mood_score: 8, mood_category: 'great', energy_level: 'high', emotions_detected: ['happy', 'motivated', 'grateful'], summary: 'Feeling energized and ready to take on the day', wellness_tip: 'Channel this energy into a creative project', affirmation: 'Your positive energy is contagious' },
  { mood_score: 6, mood_category: 'okay', energy_level: 'medium', emotions_detected: ['calm', 'reflective'], summary: 'A steady, contemplative day', wellness_tip: 'Try a 5-minute meditation to deepen this calm', affirmation: 'Peace is a strength, not a pause' },
  { mood_score: 9, mood_category: 'great', energy_level: 'high', emotions_detected: ['excited', 'confident', 'joyful'], summary: 'Incredible day with high spirits', wellness_tip: 'Write down what made today great', affirmation: 'You deserve every bit of this joy' },
  { mood_score: 5, mood_category: 'okay', energy_level: 'low', emotions_detected: ['tired', 'neutral'], summary: 'Feeling a bit drained but managing', wellness_tip: 'Prioritize sleep tonight — aim for 8 hours', affirmation: 'Rest is not weakness, it is preparation' },
];

export async function seedSampleData(uid: string): Promise<void> {
  const promises: Promise<any>[] = [];

  sampleMeals.forEach((meal, i) => {
    promises.push(addUserItem(uid, 'meals', { ...meal, timestamp: daysAgo(i) }));
  });

  sampleWorkouts.forEach((workout, i) => {
    promises.push(addUserItem(uid, 'workouts', { ...workout, timestamp: daysAgo(i) }));
  });

  sampleMoods.forEach((mood, i) => {
    promises.push(addUserItem(uid, 'moods', { ...mood, timestamp: daysAgo(i) }));
  });

  await Promise.all(promises);
}
