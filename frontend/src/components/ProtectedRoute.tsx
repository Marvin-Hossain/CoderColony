import {useState, useEffect} from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {API_CONFIG} from '@/services/config';

interface AuthResponse {
    authenticated: boolean;
}

/**
 * A component that wraps routes requiring authentication.
 * It checks the user's authentication status via an API call
 * and renders the child routes (Outlet) if authenticated,
 * otherwise redirects to the home page.
 */
const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    /** Effect to check authentication status when the component mounts. */
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        /** Calls the backend to verify the current user's session validity. */
        const checkAuth = async (): Promise<void> => {
            try {
                const headersToSend = new Headers();
                headersToSend.append('Accept', '*/*');

                const response = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                    {
                        method: 'GET',
                        headers: headersToSend,
                        credentials: 'include',
                        signal
                    }
                );

                if (signal.aborted) return;

                if (response.redirected && !response.url.startsWith(API_CONFIG.BASE_URL)) {
                    return;
                }

                if (response.ok) {
                    const data: AuthResponse = await response.json();
                    if (!signal.aborted) {
                        setIsAuthenticated(data.authenticated);
                    }
                } else if (response.status === 401 || response.status === 403) {
                    if (!signal.aborted) {
                        setIsAuthenticated(false);
                    }
                } else {
                    if (!signal.aborted) {
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name !== 'AbortError' && !signal.aborted) {
                        setIsAuthenticated(false);
                    }
                } else {
                    if (!signal.aborted) {
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

    if (isAuthenticated === true) {
        return <Outlet/>;
    } else {
        return <Navigate to="/" replace/>;
    }
};

export default ProtectedRoute;