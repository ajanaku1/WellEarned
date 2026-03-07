export const CHAT_TOOL_DECLARATIONS = [
  {
    functionDeclarations: [
      {
        name: 'get_recent_meals',
        description: 'Retrieve the user\'s recent meal logs with nutrition data',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of recent meals to retrieve (default 5)' },
          },
        },
      },
      {
        name: 'get_recent_workouts',
        description: 'Retrieve the user\'s recent workout logs with form scores',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of recent workouts to retrieve (default 5)' },
          },
        },
      },
      {
        name: 'get_recent_moods',
        description: 'Retrieve the user\'s recent mood logs with scores and emotions',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Number of recent moods to retrieve (default 5)' },
          },
        },
      },
      {
        name: 'get_wellness_stats',
        description: 'Get aggregate wellness statistics (averages, totals, streaks)',
        parameters: { type: 'object', properties: {} },
      },
    ],
  },
];

export const buildToolContext = (meals: any[], workouts: any[], moods: any[]) => ({
  get_recent_meals: ({ limit = 5 } = {}) => ({ meals: (meals || []).slice(0, limit) }),
  get_recent_workouts: ({ limit = 5 } = {}) => ({ workouts: (workouts || []).slice(0, limit) }),
  get_recent_moods: ({ limit = 5 } = {}) => ({ moods: (moods || []).slice(0, limit) }),
  get_wellness_stats: () => ({
    total_meals: (meals || []).length,
    total_workouts: (workouts || []).length,
    total_moods: (moods || []).length,
  }),
});
