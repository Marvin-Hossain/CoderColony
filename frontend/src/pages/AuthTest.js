import React, { useEffect, useState } from 'react';

const AuthTest = () => {
    const [authData, setAuthData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAuthTest = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/auth/test', {
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const data = await response.json();
                setAuthData(data);
            } catch (error) {
                console.error('Error fetching auth test:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAuthTest();
    }, []);

    if (loading) return <div>Loading authentication status...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Authentication Test</h1>
            <pre>{JSON.stringify(authData, null, 2)}</pre>
            <div>
                <a href="http://localhost:3000/login">Back to Login</a>
            </div>
        </div>
    );
};

export default AuthTest; 