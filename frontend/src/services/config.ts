interface AuthEndpoints {
    USER: string;
    TEST: string;
    LOGOUT: string;
    GITHUB: string;
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