# WellEarned — Architecture

## System Overview

```mermaid
graph TB
    subgraph Client["React SPA (Vite)"]
        Landing[Landing Page]
        Dashboard[Dashboard]
        Meals[Meal Analyzer]
        Workout[Workout Coach]
        Mood[Mood Tracker]
        Chat[Chat Coach]
        Progress[Progress Page]
    end

    subgraph API["Vercel Serverless Functions"]
        GeminiAPI["/api/gemini"]
        GeminiStream["/api/gemini-stream"]
    end

    subgraph Services["External Services"]
        Gemini[Google Gemini 3 API]
        FireAuth[Firebase Auth]
        Firestore[Cloud Firestore]
    end

    Client --> API
    GeminiAPI --> Gemini
    GeminiStream --> Gemini
    Client --> FireAuth
    Client --> Firestore
```

## Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Landing
    participant AuthContext
    participant Firebase as Firebase Auth
    participant App as Dashboard

    alt Guest / Demo Mode
        User->>Landing: Click "Try Demo"
        Landing->>AuthContext: loginAsGuest()
        AuthContext->>Firebase: signInAnonymously()
        Firebase-->>AuthContext: Anonymous User
        AuthContext-->>Landing: user.isAnonymous = true
        Landing->>App: Navigate to /dashboard
        App->>App: seedDemoData(uid)
        Note over App: GuestBanner shows "Demo Mode"
    end

    alt Email / Google Auth
        User->>Landing: Click "Get Started"
        Landing->>AuthContext: signup() / loginWithGoogle()
        AuthContext->>Firebase: createUser / signInWithPopup
        Firebase-->>AuthContext: Authenticated User
        AuthContext-->>App: Navigate to /dashboard
    end
```

## Meal Analysis Flow

```mermaid
sequenceDiagram
    participant User
    participant MealPage as Meal Page
    participant Hook as useGemini
    participant API as /api/gemini
    participant Gemini as Gemini 3

    User->>MealPage: Upload meal photo
    MealPage->>MealPage: fileToBase64(photo)
    MealPage->>Hook: analyze(MEAL_PROMPT, [imagePart])
    Hook->>API: POST { prompt, fileParts }
    API->>Gemini: generateContent(multimodal)
    Gemini-->>API: JSON response
    API-->>Hook: { text: JSON }
    Hook-->>MealPage: Parsed nutrition data
    MealPage->>MealPage: Render NutritionCard
    MealPage->>Firestore: addItem(nutritionData)
```

## Streaming Chat Flow

```mermaid
sequenceDiagram
    participant User
    participant ChatPage as Chat Coach
    participant Hook as useGeminiStream
    participant API as /api/gemini-stream
    participant Gemini as Gemini 3

    User->>ChatPage: Send message
    ChatPage->>ChatPage: buildContext(meals, workouts, moods)
    ChatPage->>Hook: streamChat(history, systemPrompt, onChunk)
    Hook->>API: POST { history, systemPrompt }
    API->>Gemini: generateContentStream()

    loop SSE Chunks
        Gemini-->>API: text chunk
        API-->>Hook: data: { text }
        Hook->>ChatPage: onChunk(accumulated)
        ChatPage->>ChatPage: Update streaming UI
    end

    API-->>Hook: data: [DONE]
    ChatPage->>Firestore: Save chat history
```

## AI Insights Flow (Cross-Feature)

```mermaid
sequenceDiagram
    participant Dashboard
    participant AIInsights as AIInsights Component
    participant Hook as useGemini
    participant API as /api/gemini
    participant Gemini as Gemini 3

    Dashboard->>AIInsights: meals, workouts, moods props
    AIInsights->>AIInsights: Filter last 14 days
    AIInsights->>AIInsights: Build cross-feature JSON
    AIInsights->>Hook: analyze(INSIGHTS_PROMPT + data)
    Hook->>API: POST { prompt }
    API->>Gemini: generateContent()
    Gemini-->>API: JSON array of insights
    API-->>Hook: Parsed insights
    Hook-->>AIInsights: [{title, description, type}]
    AIInsights->>AIInsights: Cache in localStorage
    AIInsights->>AIInsights: Render insight cards
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Routing | React Router v6 |
| State | React Context + Hooks |
| AI | Google Gemini 3 API (multimodal + streaming) |
| Auth | Firebase Authentication (email, Google, anonymous) |
| Database | Cloud Firestore (real-time) |
| Hosting | Vercel (SPA + serverless functions) |
| API | Vercel Serverless Functions (Node.js) |
