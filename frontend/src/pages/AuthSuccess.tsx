import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {API_CONFIG} from '@/services/config';

interface AuthTestResponse {
    authenticated: boolean;
    message?: string;
}

interface UserResponse {
    authenticated: boolean;
    user?: {
        username: string;
        id: string;
    };
    reason?: string;
}

/**
 * Component rendered after successful external authentication (e.g., OAuth redirect).
 * It verifies the session with the backend and redirects the user to the dashboard
 * or displays an error if verification fails.
 */
const AuthSuccess = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    /** Effect runs on mount to verify the authentication status post-redirect. */
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        /** Verifies authentication first with a test endpoint, then fetches user data. */
        const checkAuthStatus = async (): Promise<void> => {
            setError(null);
            try {
                // First, hit a simple endpoint to confirm backend session validity
                const testResponse = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.TEST,
                    {credentials: 'include', signal}
                );

                if (signal.aborted) return;

                if (!testResponse.ok) {
                    throw new Error(`Authentication test endpoint failed: ${testResponse.status}`);
                }

                const testData: AuthTestResponse = await testResponse.json();

                if (signal.aborted) return;

                if (testData.authenticated) {
                    // If the test passes, attempt to fetch user details to complete the process
                    const userResponse = await fetch(
                        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                        {credentials: 'include', signal}
                    );

                    if (signal.aborted) return;

                    if (!userResponse.ok) {
                        throw new Error(`Fetching user data failed: ${userResponse.status}`);
                    }

                    const userData: UserResponse = await userResponse.json();

                    if (signal.aborted) return;

                    // Final success condition: both test and user endpoints confirm authentication
                    if (userData.authenticated && userData.user) {
                        navigate('/dashboard', {replace: true});
                    } else {
                        setError(`Authentication check passed but user data couldn't be retrieved: ${userData.reason || 'unknown reason'}`);
                    }
                } else {
                    setError("Authentication check failed.");
                }
            } catch (error) {
                // Handle network errors or other exceptions during the process
                if (error instanceof Error) {
                    if (error.name !== 'AbortError' && !signal.aborted) {
                        console.error('Error in authentication flow:', error);
                        setError(`Authentication process error: ${error.message}`);
                    }
                } else {
                    if (!signal.aborted) {
                        console.error('Unknown error in authentication flow:', error);
                        setError('An unknown error occurred during authentication.');
                    }
                }
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void checkAuthStatus();

        // Cleanup function to abort fetch if the component unmounts
        return () => {
            abortController.abort();
        };
    }, [navigate]);

    if (loading) {
        return <div>Processing authentication, please wait...</div>;
    }

    // Display error message and a way back if authentication failed
    if (error) {
        return (
            <div>
                Authentication failed: {error}
                <br/>
                <button onClick={() => navigate('/')}>Return to Login</button>
            </div>
        );
    }

    return <div>Authentication successful, redirecting...</div>;
};

export default AuthSuccess;
