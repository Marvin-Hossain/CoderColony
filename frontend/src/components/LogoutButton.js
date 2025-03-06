import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('user');
      
      // Call backend logout endpoint
      await fetch('http://localhost:8080/logout', {
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