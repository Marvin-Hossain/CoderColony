import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Toolbar.css';
import { API_CONFIG } from '@/services/config';
import LogoutButton from './LogoutButton';

interface UserData {
  authenticated: boolean;
  username: string;
  avatarUrl: string;
}

interface UserState {
  data: UserData | null;
  isLoading: boolean;
  error: string | null;
}

const Toolbar: React.FC = () => {
  const [userState, setUserState] = useState<UserState>({
    data: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const abortController = new AbortController();

    const fetchUser = async () => {
      try {
        const response = await fetch(
          API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
          { 
            credentials: 'include',
            signal: abortController.signal 
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        // Only extract needed fields
        setUserState({
          data: {
            authenticated: userData.authenticated,
            username: userData.username,
            avatarUrl: userData.avatarUrl
          },
          isLoading: false,
          error: null
        });
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return; // Ignore abort errors
        }
        setUserState(prevState => ({
          ...prevState,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred'
        }));
      }
    };

    fetchUser();

    return () => {
      abortController.abort();
    };
  }, []);

  if (userState.isLoading) {
    return (
      <nav className="toolbar">
        <div className="toolbar-content">
          <div className="toolbar-brand">
            <Link to="/dashboard">JobHuntHub</Link>
          </div>
          <div className="toolbar-user">
            <span>Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="toolbar">
      <div className="toolbar-content">
        <div className="toolbar-brand">
          <Link to="/dashboard">JobHuntHub</Link>
        </div>
        <ul className="toolbar-links">
          <li><Link to="/progress">Progress</Link></li>
          <li><Link to="/practice">Practice</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/about-us">About Us</Link></li>
        </ul>
        <div className="toolbar-user">
          {userState.data && (
            <>
              {userState.data.avatarUrl && (
                <img 
                  src={userState.data.avatarUrl} 
                  alt={`${userState.data.username}'s profile`} 
                  className="user-avatar"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              )}
              <span className="username">{userState.data.username}</span>
            </>
          )}
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default Toolbar; 