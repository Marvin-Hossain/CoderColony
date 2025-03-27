export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  BASE_AUTH_URL: 'http://localhost:8080',
  ENDPOINTS: {
    JOBS: '/jobs',
    BEHAVIORAL: '/behavioral',
    TECHNICAL: '/technical',
    PROGRESS: '/progress',
    AUTH: {
      USER: '/auth/user',
      TEST: '/auth/test',
      LOGOUT: '/auth/logout',
      GITHUB: '/oauth2/authorization/github'
    },
    JOBS_STATS: '/jobs/dashboard-stats'
  }
}; 