interface AuthEndpoints {
    USER: string;
    TEST: string;
    LOGOUT: string;
    GITHUB: string;
    GOOGLE: string;
    LINKEDIN: string;
}

interface ApiEndpoints {
    JOBS: string;
    BEHAVIORAL: string;
    TECHNICAL: string;
    PROGRESS: string;
    AUTH: AuthEndpoints;
    JOBS_STATS: string;
}

interface ApiConfig {
    BASE_URL: string;
    BASE_AUTH_URL: string;
    ENDPOINTS: ApiEndpoints;
}

export const API_CONFIG: ApiConfig = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    BASE_AUTH_URL: import.meta.env.VITE_AUTH_URL || 'http://localhost:8080',
    ENDPOINTS: {
        JOBS: '/jobs',
        BEHAVIORAL: '/questions/behavioral',
        TECHNICAL: '/questions/technical',
        PROGRESS: '/progress',
        AUTH: {
            USER: '/auth/user',
            TEST: '/auth/test',
            LOGOUT: '/auth/logout',
            GITHUB: '/oauth2/authorization/github',
            GOOGLE: '/oauth2/authorization/google',
            LINKEDIN: '/oauth2/authorization/linkedin'
        },
        JOBS_STATS: '/jobs/dashboard-stats'
    }
}; 