import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { API_CONFIG } from '@/services/config';

interface AuthResponse {
    authenticated: boolean;
    // Add other user fields if needed/returned by the API
}

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Add AbortController for cleanup
        const abortController = new AbortController();
        const signal = abortController.signal;

        const checkAuth = async (): Promise<void> => {
            // Don't reset loading to true here, it starts as true
            try {
                const response = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                    // Pass signal
                    { credentials: 'include', signal }
                );

                // Check signal before processing response
                if (signal.aborted) return;

                if (response.ok) {
                    const data: AuthResponse = await response.json();
                     // Check signal again before setting state
                     if (!signal.aborted) {
                         setIsAuthenticated(data.authenticated);
                     }
                } else {
                    // Handle non-ok responses (like 401, 403, 500 etc.)
                     if (!signal.aborted) {
                         console.error(`Auth check failed with status: ${response.status}`);
                         setIsAuthenticated(false);
                     }
                }
            } catch (error) {
                 // Add instanceof Error check, ignore AbortError
                 if (error instanceof Error) {
                    if (error.name !== 'AbortError' && !signal.aborted) {
                        console.error('Auth check fetch failed:', error.message);
                        setIsAuthenticated(false); // Treat fetch errors as unauthenticated
                    }
                 } else {
                     if (!signal.aborted) {
                         console.error('An unknown error occurred during auth check:', error);
                         setIsAuthenticated(false);
                     }
                 }
            } finally {
                // Check signal before setting final loading state
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        // Cleanup function
        return () => {
            abortController.abort();
        };
    }, []); // Empty dependency array is correct here

    if (loading) {
        // Consider a more specific loading indicator if desired
        return <div>Authenticating...</div>;
    }

    // Render children (Outlet) or redirect based on state
    return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />; // Added 'replace' for better history handling
};

export default ProtectedRoute; 