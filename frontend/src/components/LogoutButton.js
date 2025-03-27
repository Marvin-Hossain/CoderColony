import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../services/config';

const LogoutButton = () => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('user');
      
      // Call backend logout endpoint
      await fetch(API_CONFIG.BASE_AUTH_URL + API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include'
      });
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton; 