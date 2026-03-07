import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserProfile } from '../contexts/UserProfileContext'
import { useAuth } from '../contexts/AuthContext'

const GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', emoji: '🏃' },
  { id: 'build_muscle', label: 'Build Muscle', emoji: '💪' },
  { id: 'eat_healthier', label: 'Eat Healthier', emoji: '🥗' },
  { id: 'reduce_stress', label: 'Reduce Stress', emoji: '🧘' },
  { id: 'sleep_better', label: 'Sleep Better', emoji: '😴' },
  { id: 'boost_energy', label: 'Boost Energy', emoji: '⚡' },
]

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+']
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const DIET_PREFS = [
  { id: 'none', label: 'No restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'keto', label: 'Keto' },
  { id: 'gluten_free', label: 'Gluten-free' },
  { id: 'dairy_free', label: 'Dairy-free' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
]

export default function Onboarding() {
  const { user } = useAuth()
  const { updateProfile } = useUserProfile()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  const [fitnessGoals, setFitnessGoals] = useState([])
  const [ageRange, setAgeRange] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState('')
  const [dietaryPreferences, setDietaryPreferences] = useState([])

  function toggleGoal(id) {
    setFitnessGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id])
  }

  function toggleDiet(id) {
    if (id === 'none') {
      setDietaryPreferences(['none'])
    } else {
      setDietaryPreferences((prev) => {
        const without = prev.filter((d) => d !== 'none')
        return without.includes(id) ? without.filter((d) => d !== id) : [...without, id]
      })
    }
  }

  async function handleFinish() {
    setSaving(true)
    try {
      await updateProfile({
        fitnessGoals,
        ageRange,
        fitnessLevel,
        dietaryPreferences,
        onboardingComplete: true,
        completedAt: new Date().toISOString(),
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      console.error('Failed to save onboarding:', error)
    } finally {
      setSaving(false)
    }
  }

  const firstName = (user?.displayName || 'there').split(' ')[0]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src="/WellEarnedLogo.png" alt="WellEarned" className="w-14 h-14 rounded-xl mx-auto mb-3 shadow-md" />
          <h1 className="text-2xl font-bold gradient-text">Welcome, {firstName}!</h1>
          <p className="text-gray-500 text-sm mt-1">Let&apos;s personalize your wellness journey</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="card">
          {/* Step 1: Goals */}
          {step === 1 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-1">What are your fitness goals?</h2>
              <p className="text-sm text-gray-500 mb-4">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-3 rounded-lg border-2 text-left text-sm font-medium transition-colors ${
                      fitnessGoals.includes(goal.id)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-emerald-300 text-gray-600'
                    }`}
                  >
                    <span className="text-lg mr-1.5">{goal.emoji}</span>
                    {goal.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={fitnessGoals.length === 0}
                className="btn-primary w-full mt-6"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Age & Fitness Level */}
          {step === 2 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-4">About You</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_RANGES.map((range) => (
                      <button
                        key={range}
                        onClick={() => setAgeRange(range)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                          ageRange === range
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-emerald-300 text-gray-600'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Level</label>
                  <div className="flex gap-2">
                    {FITNESS_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setFitnessLevel(level)}
                        className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                          fitnessLevel === level
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:border-emerald-300 text-gray-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!ageRange || !fitnessLevel}
                  className="btn-primary flex-1"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Dietary Preferences */}
          {step === 3 && (
            <div>
              <h2 className="font-semibold text-gray-800 mb-1">Dietary Preferences</h2>
              <p className="text-sm text-gray-500 mb-4">Select any that apply</p>
              <div className="grid grid-cols-2 gap-2">
                {DIET_PREFS.map((diet) => (
                  <button
                    key={diet.id}
                    onClick={() => toggleDiet(diet.id)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                      dietaryPreferences.includes(diet.id)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:border-emerald-300 text-gray-600'
                    }`}
                  >
                    {diet.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
                <button
                  onClick={handleFinish}
                  disabled={saving || dietaryPreferences.length === 0}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Saving...' : 'Get Started'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
