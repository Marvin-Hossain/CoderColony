import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { API_CONFIG } from '../services/config';

interface AuthResponse {
    authenticated: boolean;
}

const ProtectedRoute: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAuth = async (): Promise<void> => {
            try {
                const response = await fetch(
                    API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
                    { credentials: 'include' }
                );

                if (response.ok) {
                    const data: AuthResponse = await response.json();
                    setIsAuthenticated(data.authenticated);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute; 