import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Toolbar.css';
import { API_CONFIG } from '@/services/config';
import LogoutButton from './LogoutButton';
import { cn } from '@/lib/cn';
import { menuToggleStyles, mobileMenuOverlayStyles, mobileMenuStyles, toolbarStyles, toolbarContentStyles, brandLinkStyles, brandLogoStyles, brandTextStyles, desktopMenuStyles, toolbarMenuCenterStyles, toolbarLinksStyles, toolbarLinkAnchorStyles, toolbarUserStyles, userAvatarStyles, mobileMenuContentStyles, mobileMenuLinksStyles } from './ui/toolbar';

interface UserData {
  authenticated: boolean;
  username: string;
  primaryEmail: string;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Toggle body scroll when menu is open
    document.body.style.overflow = mobileMenuOpen ? 'auto' : 'hidden';
  };

  useEffect(() => {
    const abortController = new AbortController();

    const fetchUser = async () => {
      try {
        const authResponse = await fetch(
          API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.AUTH.USER,
          { 
            credentials: 'include',
            signal: abortController.signal 
          }
        );
        
        if (!authResponse.ok) {
          throw new Error(`Failed to fetch user data: ${authResponse.status}`);
        }

        const authData = await authResponse.json();

        if (authData.authenticated) {
          const profileResponse = await fetch(
              API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROFILE.USER,
              {credentials: 'include', signal: abortController.signal}
          );
          const profileData = await profileResponse.json();

          // Only extract needed fields
          setUserState({
            data: {
              authenticated: authData.authenticated,
              username: profileData.username,
              primaryEmail: profileData.primaryEmail,
              avatarUrl: profileData.avatarUrl
            },
            isLoading: false,
            error: null
          });
        }
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

    // Close mobile menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (mobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-toggle')) {
        setMobileMenuOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('click', handleClickOutside);

    // Handle escape key to close menu
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        document.body.style.overflow = 'auto';
      }
    };

    document.addEventListener('keydown', handleEscKey);

    return () => {
      abortController.abort();
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto'; // Ensure scroll is restored on unmount
    };
  }, [mobileMenuOpen]);

  if (userState.isLoading) {
    return (
      <nav className={cn(toolbarStyles())}>
        <div className={cn(toolbarContentStyles())}>
          <div className="toolbar-brand">
            <Link to="/dashboard" className={cn(brandLinkStyles())}>
              <div className={cn(brandLogoStyles())}>
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="8" fill="#ffffff"/>
                  <path d="M8 12L20 8L32 12V28L20 32L8 28V12Z" fill="#4d6bfe" stroke="#4d6bfe" strokeWidth="1.5"/>
                  <path d="M12 16L28 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 20L24 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 24L28 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="20" cy="12" r="2" fill="#4d6bfe"/>
                  <circle cx="16" cy="28" r="2" fill="#4d6bfe"/>
                  <circle cx="24" cy="28" r="2" fill="#4d6bfe"/>
                </svg>
              </div>
              <span className={cn(brandTextStyles())}>CoderColony</span>
            </Link>
          </div>
          <div className={cn(toolbarUserStyles())}>
            <span>Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  const renderNavLinks = () => (
    <ul className={cn(toolbarLinksStyles())}>
      <li><Link className={cn(toolbarLinkAnchorStyles())} to="/progress" onClick={() => setMobileMenuOpen(false)}>Progress</Link></li>
      <li><Link className={cn(toolbarLinkAnchorStyles())} to="/job-apps" onClick={() => setMobileMenuOpen(false)}>Applications</Link></li>
      <li><Link className={cn(toolbarLinkAnchorStyles())} to="/practice" onClick={() => setMobileMenuOpen(false)}>Practice</Link></li>
      <li><Link className={cn(toolbarLinkAnchorStyles())} to="/about-us" onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
    </ul>
  );

  const renderUserSection = () => (
    <div className={cn(toolbarUserStyles())}>
      {userState.data && (
        <>
          {userState.data.avatarUrl && (
            <img 
              src={userState.data.avatarUrl} 
              alt={`${userState.data.username}'s profile`}
              className={cn(userAvatarStyles())}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          )}
          <span className="primary-email">{userState.data.primaryEmail}</span>
        </>
      )}
      <LogoutButton />
    </div>
  );

  return (
    <nav className={cn(toolbarStyles())}>
      <div className={cn(toolbarContentStyles())}>
        <div className="toolbar-brand">
          <Link to="/dashboard" className={cn(brandLinkStyles())}>
            <div className={cn(brandLogoStyles())}>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#ffffff"/>
                <path d="M8 12L20 8L32 12V28L20 32L8 28V12Z" fill="#4d6bfe" stroke="#4d6bfe" strokeWidth="1.5"/>
                <path d="M12 16L28 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 20L24 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 24L28 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={cn(brandTextStyles())}>CoderColony</span>
          </Link>
        </div>
        
        {/* Desktop menu */}
        <div className={cn(desktopMenuStyles())}>
          <div className={cn(toolbarMenuCenterStyles())}>
            {renderNavLinks()}
          </div>
          {renderUserSection()}
        </div>
        
        {/* Mobile menu toggle button */}
        <button 
          className={cn(menuToggleStyles({ open: mobileMenuOpen }))}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-icon"></span>
        </button>
        
        {/* Mobile menu overlay */}
        <button 
          type="button"
          aria-label="Close menu overlay"
          className={cn(mobileMenuOverlayStyles({ active: mobileMenuOpen }))}
          onClick={() => setMobileMenuOpen(false)}
        ></button>
        
        {/* Mobile sidebar */}
        <div className={cn(mobileMenuStyles({ open: mobileMenuOpen }))}>
          <div className={cn(mobileMenuContentStyles())}>
            <div className={cn(mobileMenuLinksStyles())}>
              {renderNavLinks()}
            </div>
            <div className="mobile-menu-user">
              {renderUserSection()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Toolbar; 