import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../services/config';

const AuthSuccess = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // First try the test endpoint to see raw authentication data
        const checkAuthStatus = async () => {
            try {
                const testResponse = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.TEST,
                    { credentials: 'include' }
                );
                
                if (!testResponse.ok) {
                    throw new Error(`Test endpoint failed: ${testResponse.status}`);
                }
                
                const testData = await testResponse.json();
                console.log("Raw auth data:", testData);
                
                // If authenticated according to test endpoint, try the user endpoint
                if (testData.authenticated) {
                    const userResponse = await fetch(
                        API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                        { credentials: 'include' }
                    );
                    
                    if (!userResponse.ok) {
                        throw new Error(`User endpoint failed: ${userResponse.status}`);
                    }
                    
                    const userData = await userResponse.json();
                    console.log("User data:", userData);
                    
                    if (userData.authenticated) {
                        // Store user data in localStorage
                        localStorage.setItem('user', JSON.stringify(userData.user));
                        console.log("User authenticated, redirecting to dashboard");
                        navigate('/dashboard');
                    } else {
                        console.log("Not authenticated according to /api/auth/user");
                        setError(`Authentication succeeded but user data couldn't be retrieved: ${userData.reason || 'unknown reason'}`);
                    }
                } else {
                    setError("Not authenticated according to test endpoint");
                }
            } catch (error) {
                console.error('Error in authentication flow:', error);
                setError(error.message);
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
        return (
            <div>
                <h2>Authentication Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>Return to Home</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Authentication Successful</h2>
            <p>Redirecting to dashboard...</p>
        </div>
    );
};

export default AuthSuccess; 