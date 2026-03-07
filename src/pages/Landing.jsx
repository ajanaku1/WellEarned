import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const CAPABILITIES = [
  {
    icon: '📸',
    title: 'Multimodal Vision',
    desc: 'Analyze meal photos for instant nutrition breakdown',
    color: 'from-orange-400 to-amber-400',
  },
  {
    icon: '🎥',
    title: 'Video Understanding',
    desc: 'Coach workout form from video frames',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    icon: '🎤',
    title: 'Audio NLU',
    desc: 'Detect mood and emotions from voice memos',
    color: 'from-purple-400 to-pink-400',
  },
  {
    icon: '⚡',
    title: 'Streaming + Function Calling',
    desc: 'Real-time chat with tool use for live data queries',
    color: 'from-emerald-400 to-teal-400',
  },
  {
    icon: '📋',
    title: 'Structured Output',
    desc: 'Schema-validated JSON responses for reliable data',
    color: 'from-indigo-400 to-violet-400',
  },
  {
    icon: '🧠',
    title: 'Cross-Feature Reasoning',
    desc: 'AI insights correlating diet, exercise, and mood',
    color: 'from-rose-400 to-red-400',
  },
]

const PIPELINE_STEPS = [
  { icon: '📤', label: 'Upload', desc: 'Photo, video, voice, or text' },
  { icon: '🔬', label: 'Analyze', desc: 'Gemini 3 multimodal AI' },
  { icon: '💡', label: 'Insights', desc: 'Structured, actionable data' },
  { icon: '🎯', label: 'Action', desc: 'Personalized recommendations' },
]

export default function Landing() {
  const { user } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/WellEarnedLogo.png" alt="WellEarned" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg gradient-text">WellEarned</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/demo" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors min-h-[44px] flex items-center px-2">
              Try Demo
            </a>
            <a href="/login" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors min-h-[44px] flex items-center px-2">
              Sign In
            </a>
            <a href="/signup" target="_blank" rel="noopener noreferrer" className="btn-primary text-sm px-4 py-2">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Gemini Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full px-4 py-2.5 mb-6 shadow-sm">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-sm font-medium text-emerald-700">Built on Gemini 3 &mdash; 6 API Capabilities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Your <span className="gradient-text">AI-Powered</span> Wellness Coach
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Powered by Google Gemini 3 with structured output, streaming chat, function calling, and real-time vision. Track meals, workouts, and mood with intelligent AI analysis.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="/signup" target="_blank" rel="noopener noreferrer" className="btn-primary text-base px-8 py-3.5 inline-block">
              Get Started &mdash; It&apos;s Free
            </a>
            <a href="/demo" target="_blank" rel="noopener noreferrer" className="btn-secondary text-base px-8 py-3.5 inline-block">
              Try Demo
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { icon: '📸', label: 'Meal Vision' },
              { icon: '🎥', label: 'Workout Video' },
              { icon: '🎤', label: 'Mood Analysis' },
              { icon: '💬', label: 'Streaming Chat' },
              { icon: '🧠', label: 'AI Insights' },
            ].map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-emerald-100 rounded-full px-4 py-2 text-sm text-gray-700 shadow-sm"
              >
                <span>{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Gemini Capabilities */}
      <section className="py-20 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              6 <span className="gradient-text">Gemini 3</span> Capabilities
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              Deep API integration showcasing the full power of Google&apos;s most advanced AI model.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="card hover:shadow-md transition-shadow duration-200">
                <div className={`w-14 h-14 bg-gradient-to-br ${cap.color} rounded-xl flex items-center justify-center mb-4 text-2xl`}>
                  {cap.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{cap.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Pipeline */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              The <span className="gradient-text">AI Pipeline</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
              From raw input to actionable wellness insights in seconds.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.label} className="text-center relative">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 text-2xl">
                  {step.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold mb-2">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{step.label}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 -right-3 text-gray-300 text-xl">&rarr;</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Start Your Wellness Journey Today
          </h2>
          <p className="mt-4 text-emerald-100 text-lg max-w-xl mx-auto">
            Join WellEarned and let Gemini 3 AI help you build lasting healthy habits. Free to use, always.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-emerald-700 font-semibold px-8 py-3.5 rounded-lg hover:bg-emerald-50 transition-colors text-base shadow-lg active:scale-[0.97]"
            >
              Create Your Free Account
            </a>
            <a
              href="/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white/20 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/30 transition-colors text-base border border-white/30 active:scale-[0.97]"
            >
              Try Demo Instantly
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/WellEarnedLogo.png" alt="WellEarned" className="w-7 h-7 rounded" />
              <span className="font-semibold text-white">WellEarned</span>
              <span className="text-xs text-gray-500 ml-2">Built on Gemini 3</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="/login" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sign In</a>
              <a href="/signup" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sign Up</a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} WellEarned. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
