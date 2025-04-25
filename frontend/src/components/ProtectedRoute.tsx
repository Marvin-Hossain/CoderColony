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
                const response = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                    {credentials: 'include', signal}
                );

                if (signal.aborted) return;

                if (response.ok) {
                    const data: AuthResponse = await response.json();
                    if (!signal.aborted) {
                        setIsAuthenticated(data.authenticated);
                    }
                } else {
                    // If the check fails (e.g., 401, 403, 500), treat as unauthenticated
                    if (!signal.aborted) {
                        console.error(`Auth check failed with status: ${response.status}`);
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                // Treat network errors or other exceptions as unauthenticated
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
                // Ensure loading state is updated unless the request was aborted
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        // Fire off the auth check; internal error handling manages state
        void checkAuth();

        // Cleanup function to abort fetch if the component unmounts during the request
        return () => {
            abortController.abort();
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Display loading indicator while checking auth status
    if (loading) {
        return <div>Authenticating...</div>;
    }

    // Render the nested routes if authenticated, otherwise redirect to home/login
    return isAuthenticated ? <Outlet/> : <Navigate to="/" replace/>;
};

export default ProtectedRoute; 