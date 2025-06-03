
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { AppRoutes } from '../types';
import { 
  NotificationIcon, 
  UserIcon, 
  ChevronDownIcon, 
  HelpIcon, 
  StatusIcon, 
  SearchIcon, 
  LogoutIcon,
  CloudEdgeIcon,
  APP_NAME
} from '../constants';

interface HeaderProps {
  isLoggedIn: boolean;
  userName?: string;
}

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate(AppRoutes.Login);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-worldposta-banner-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-worldposta-banner dark:focus:ring-offset-brand-bg-dark focus:ring-worldposta-primary transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="User avatar" className="w-8 h-8 rounded-full border-2 border-white/50" /> 
        ) : (
            <UserIcon className="w-7 h-7 text-brand-text dark:text-brand-text-light" />
        )}
        <span className="hidden md:inline text-sm font-medium text-brand-text dark:text-brand-text-light">{user?.displayName}</span>
        <ChevronDownIcon className={`w-5 h-5 text-brand-text dark:text-brand-text-light transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-brand-bg-light dark:bg-brand-bg-dark-alt rounded-md shadow-xl z-20 py-1 ring-1 ring-black ring-opacity-5">
          <Link to={AppRoutes.Profile} className="block px-4 py-2 text-sm text-brand-text dark:text-brand-text-light hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark">Profile</Link>
          <Link to={AppRoutes.Security} className="block px-4 py-2 text-sm text-brand-text dark:text-brand-text-light hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark">Account Settings</Link>
          <Link to="/app/billing" className="block px-4 py-2 text-sm text-brand-text dark:text-brand-text-light hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark">Billing</Link>
          <Link to="/app/support" className="block px-4 py-2 text-sm text-brand-text dark:text-brand-text-light hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark">Support</Link>
          <div className="border-t border-brand-border dark:border-brand-border-dark my-1"></div>
          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-danger dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-600/20"
          >
            <LogoutIcon className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};


export const Header: React.FC<HeaderProps> = ({ isLoggedIn, userName }) => {
  return (
    <header className="bg-worldposta-banner text-brand-text dark:text-brand-text-light shadow-md fixed w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link 
          to={isLoggedIn ? AppRoutes.Dashboard : AppRoutes.Login} 
          className="flex items-center space-x-2 hover:opacity-90 transition-opacity" 
          aria-label={`${APP_NAME} Home`}
        >
          <CloudEdgeIcon className="h-8 w-8 text-worldposta-primary" />
          <span className="text-xl font-bold">
            <span style={{ color: '#2a3c52' }}>World</span>
            <span className="text-worldposta-primary">Posta</span>
          </span>
        </Link>
        
        <nav className="flex items-center space-x-3 sm:space-x-4">
          {isLoggedIn ? (
            <>
              <div className="relative hidden md:block group">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-brand-text-secondary group-focus-within:opacity-100" />
                </span>
                <input 
                  type="search" 
                  placeholder="Search..." 
                  aria-label="Search"
                  className="pl-10 pr-4 py-2 w-48 lg:w-64 rounded-md bg-worldposta-banner-dark bg-opacity-60 text-brand-text dark:text-brand-text-light placeholder-brand-text-secondary dark:placeholder-brand-text-light-secondary focus:outline-none focus:ring-1 focus:ring-worldposta-primary focus:bg-worldposta-banner-dark focus:bg-opacity-100 focus:placeholder-opacity-100 transition-all duration-300"
                />
              </div>
              <button aria-label="Notifications" className="p-2 rounded-full hover:bg-worldposta-banner-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-worldposta-banner dark:focus:ring-offset-brand-bg-dark focus:ring-worldposta-primary transition-colors">
                <NotificationIcon className="w-6 h-6" />
              </button>
              <ProfileDropdown />
            </>
          ) : (
            <>
              <Link to="#" className="flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-worldposta-banner-dark hover:bg-opacity-70 transition-colors text-sm font-medium">
                <HelpIcon className="w-5 h-5" /> 
                <span>Help</span>
              </Link>
              <Link to="#" className="flex items-center space-x-1 px-3 py-1.5 rounded-md hover:bg-worldposta-banner-dark hover:bg-opacity-70 transition-colors text-sm font-medium">
                <StatusIcon className="w-5 h-5" /> 
                <span>Status</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
