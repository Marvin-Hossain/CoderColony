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
                console.log("Checking auth status...");
                const response = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                    {
                        credentials: 'include',
                        signal
                    }
                );

                if (signal.aborted) return;

                if (response.redirected && !response.url.startsWith(API_CONFIG.BASE_URL)) {
                   console.log(`Redirected away from API to: ${response.url}. Assuming auth redirect.`);
                   return; 
                }

                if (response.ok) {
                    console.log("Auth check successful (response.ok)");
                    const data: AuthResponse = await response.json();
                    if (!signal.aborted) {
                        setIsAuthenticated(data.authenticated);
                        console.log(`Authentication status from API: ${data.authenticated}`);
                    }
                } else if (response.status === 401 || response.status === 403) {
                    console.log(`Auth check failed: Status ${response.status}. User is unauthenticated.`);
                    if (!signal.aborted) {
                        setIsAuthenticated(false);
                    }
                } else {
                    console.error(`Auth check failed with status: ${response.status}`);
                    if (!signal.aborted) {
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    if (error.name !== 'AbortError' && !signal.aborted) {
                        console.error('Auth check fetch failed:', error.name, error.message);
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
                    console.log("Finished auth check, setting loading to false.");
                }
            }
        };

        void checkAuth();

        return () => {
            abortController.abort();
        };
    }, []);

    if (loading) {
        console.log("Render: Loading...");
        return <div>Authenticating...</div>;
    }

    if (isAuthenticated === true) {
        console.log("Render: Authenticated, rendering Outlet.");
        return <Outlet/>;
    } else {
        console.log("Render: Not authenticated, navigating to /.");
        return <Navigate to="/" replace/>;
    }
};

export default ProtectedRoute; 