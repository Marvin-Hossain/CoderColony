import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API_CONFIG, FEATURE_FLAGS } from '@/services/config';
import LogoutButton from './LogoutButton';
import './Navbar.css';
import { cn } from '@/lib/cn';
import {
  navLinkStyles,
  brandLinkStyles,
  brandLogoStyles,
  desktopMenuStyles,
  navbarMenuCenterStyles,
    navbarLinksStyles,
    navbarUserStyles,
    userAvatarStyles,
  mobileMenuContentStyles,
  mobileMenuLinksStyles,
} from './ui/navbar';
import {
  menuToggleStyles,
  mobileMenuOverlayStyles,
  mobileMenuStyles,
} from './ui/toolbar';

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

const Navbar: React.FC = () => {
  const [userState, setUserState] = useState<UserState>({
    data: null,
    isLoading: true,
    error: null
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

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
        } else {
          setUserState({
            data: null,
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

  const renderNavLinks = () => {
    const isActive = (path: string) => location.pathname.startsWith(path);
    return (
      <ul className={cn(navbarLinksStyles(), 'pill-nav')}>
        <li>
          <Link
            to="/progress"
            className={cn(navLinkStyles({ active: isActive('/progress') }))}
            onClick={() => setMobileMenuOpen(false)}
          >
            Progress
          </Link>
        </li>
        <li>
          <Link
            to="/job-apps"
            className={cn(navLinkStyles({ active: isActive('/job-apps') }))}
            onClick={() => setMobileMenuOpen(false)}
          >
            Applications
          </Link>
        </li>
        <li>
          <Link
            to="/practice"
            className={cn(navLinkStyles({ active: isActive('/practice') }))}
            onClick={() => setMobileMenuOpen(false)}
          >
            Practice
          </Link>
        </li>
        {FEATURE_FLAGS.ABOUT_PAGE_ENABLED && (
          <li>
            <Link
              to="/about-us"
              className={cn(navLinkStyles({ active: isActive('/about-us') }))}
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
          </li>
        )}
      </ul>
    );
  };

  const renderUserSection = () => (
    <div className={cn(navbarUserStyles())}>
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

  // Don't render navbar on login page
  if (isLoginPage) {
    return null;
  }

  if (userState.isLoading) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 tw-sticky tw-top-0 tw-z-50 tw-w-full tw-border-b tw-bg-background/95 tw-backdrop-blur tw-supports-[backdrop-filter]:tw-bg-background/60">
        <div className="container tw-flex tw-h-16 tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-space-x-3">
            <Link to="/dashboard" className={cn(brandLinkStyles())}>
              <div className={cn(brandLogoStyles())}>
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="tw-w-8 tw-h-8">
                  <rect width="40" height="40" rx="8" fill="currentColor"/>
                  <path d="M8 12L20 8L32 12V28L20 32L8 28V12Z" fill="white" stroke="white" strokeWidth="1.5"/>
                  <path d="M12 16L28 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 20L24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 24L28 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="tw-font-semibold tw-text-lg">CoderColony</span>
            </Link>
          </div>
          <div className="navbar-user">
            <span>Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 tw-sticky tw-top-0 tw-z-50 tw-w-full tw-border-b tw-bg-background/95 tw-backdrop-blur tw-supports-[backdrop-filter]:tw-bg-background/60">
        <div className="container tw-flex tw-h-16 tw-items-center tw-justify-between">
          <div className="tw-flex tw-items-center tw-space-x-3">
            <Link to="/dashboard" className={cn(brandLinkStyles())}>
              <div className={cn(brandLogoStyles())}>
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="tw-w-8 tw-h-8">
                  <rect width="40" height="40" rx="8" fill="currentColor"/>
                  <path d="M8 12L20 8L32 12V28L20 32L8 28V12Z" fill="white" stroke="white" strokeWidth="1.5"/>
                  <path d="M12 16L28 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 20L24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 24L28 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="tw-font-semibold tw-text-lg">CoderColony</span>
            </Link>
          </div>
          
          
          {/* Desktop menu */}
          <div className={cn(desktopMenuStyles())}>
            <div className={cn(navbarMenuCenterStyles())}>
              {renderNavLinks()}
            </div>
            {renderUserSection()}
          </div>
          
          {/* Mobile menu toggle button */}
          <button 
            className={cn(menuToggleStyles({ open: mobileMenuOpen }), 'tw-p-2')}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-icon"></span>
          </button>
        </div>
      </nav>
      
      {/* Mobile menu overlay - moved outside nav to avoid stacking context issues */}
      <button 
        className={cn(mobileMenuOverlayStyles({ active: mobileMenuOpen }))}
        onClick={() => {
          setMobileMenuOpen(false);
          document.body.style.overflow = 'auto';
        }}
        aria-label="Close menu overlay"
      ></button>
      
      {/* Mobile sidebar - moved outside nav to avoid stacking context issues */}
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
    </>
  );
};

export default Navbar;
