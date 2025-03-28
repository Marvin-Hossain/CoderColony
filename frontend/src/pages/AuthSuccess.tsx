import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../services/config';

interface AuthTestResponse {
    authenticated: boolean;
    message?: string;
}

interface UserResponse {
    authenticated: boolean;
    user?: {
        username: string;
        id: string;
        // add other user properties as needed
    };
    reason?: string;
}

const AuthSuccess: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async (): Promise<void> => {
            try {
                // First try the test endpoint
                const testResponse = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.TEST,
                    { credentials: 'include' }
                );

                if (!testResponse.ok) {
                    throw new Error(`Test endpoint failed: ${testResponse.status}`);
                }

                const testData: AuthTestResponse = await testResponse.json();
                
                if (testData.authenticated) {
                    const userResponse = await fetch(
                        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                        { credentials: 'include' }
                    );
                    
                    if (!userResponse.ok) {
                        throw new Error(`User endpoint failed: ${userResponse.status}`);
                    }
                    
                    const userData: UserResponse = await userResponse.json();
                    
                    if (userData.authenticated && userData.user) {
                        localStorage.setItem('user', JSON.stringify(userData.user));
                        navigate('/dashboard');
                    } else {
                        setError(`Authentication succeeded but user data couldn't be retrieved: ${userData.reason || 'unknown reason'}`);
                    }
                } else {
                    setError("Not authenticated according to test endpoint");
                }
            } catch (error) {
                console.error('Error in authentication flow:', error);
                setError(error instanceof Error ? error.message : 'Unknown error occurred');
            } finally {
                setLoading(false);
            }
        };
        
        checkAuthStatus();
    }, [navigate]);

    if (loading) {
        return <div>Processing authentication, please wait...</div>;
    }

    if (error) {
        return <div>Authentication failed: {error}</div>;
    }

    return <div>Authentication successful, redirecting...</div>;
};

export default AuthSuccess;
