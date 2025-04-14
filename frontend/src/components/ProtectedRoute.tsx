import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { API_CONFIG } from '@/services/config';

interface AuthResponse {
    authenticated: boolean;
}

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const checkAuth = async (): Promise<void> => {
            try {
                const response = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                    { credentials: 'include', signal }
                );

                if (signal.aborted) return;

                if (response.ok) {
                    const data: AuthResponse = await response.json();
                     if (!signal.aborted) {
                         setIsAuthenticated(data.authenticated);
                     }
                } else {
                     if (!signal.aborted) {
                         console.error(`Auth check failed with status: ${response.status}`);
                         setIsAuthenticated(false);
                     }
                }
            } catch (error) {
                 if (error instanceof Error) {
                    if (error.name !== 'AbortError' && !signal.aborted) {
                        console.error('Auth check fetch failed:', error.message);
                        setIsAuthenticated(false);
                    }
                 } else {
                     if (!signal.aborted) {
                         console.error('An unknown error occurred during auth check:', error);
                         setIsAuthenticated(false);
                     }
                 }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void checkAuth();

        return () => {
            abortController.abort();
        };
    }, []);

    if (loading) {
        return <div>Authenticating...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute; 