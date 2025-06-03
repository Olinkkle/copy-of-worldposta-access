
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AppRoutes } from '../types';
import { EyeIcon, EyeSlashIcon, COMPANY_NAME } from '../constants'; // Use COMPANY_NAME

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || AppRoutes.Dashboard;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'user@worldposta.com' && password === 'password123') {
      auth.login(email, false); 
      navigate(from, { replace: true });
    } else if (email === 'mfa_user@worldposta.com' && password === 'password123') {
      auth.login(email, true); 
      navigate(AppRoutes.Mfa, { replace: true });
    } else {
      setError('Invalid email or password. Try user@worldposta.com or mfa_user@worldposta.com with password "password123".');
    }
    setIsLoading(false);
  };
  
  const inputClasses = "mt-1 block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark rounded-lg placeholder-brand-text-secondary placeholder-opacity-70 dark:placeholder-brand-text-light-secondary dark:placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark-alt text-brand-text dark:text-brand-text-light";
  const linkClasses = "font-medium text-worldposta-primary dark:text-worldposta-primary-light hover:text-worldposta-primary-dark dark:hover:text-worldposta-primary-light dark:hover:opacity-80 hover:underline transition-colors";


  return (
    <div className="min-h-screen flex flex-col bg-brand-bg-light-alt dark:bg-brand-bg-dark"> {/* Page background updated for light mode contrast */}
      <Header isLoggedIn={false} />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl p-8 sm:p-10"> {/* Card background */}
          <div className="text-center mb-8">
            {/* Logo-like text */}
            <h1 className="text-4xl sm:text-5xl font-bold text-worldposta-primary dark:text-worldposta-primary-light">
              {COMPANY_NAME}
            </h1>
            {/* Subheading */}
            <p className="text-brand-text-secondary dark:text-brand-text-light-secondary mt-3 text-lg">
              Sign in to your Account
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-danger/20 border border-danger dark:border-danger/50 text-danger dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-brand-text-secondary dark:text-brand-text-light-secondary hover:text-brand-text dark:hover:text-brand-text-light transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-worldposta-primary border-brand-border dark:border-brand-border-dark rounded focus:ring-worldposta-primary focus:ring-offset-brand-bg-light dark:focus:ring-offset-brand-bg-dark-alt"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-text dark:text-brand-text-light">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-brand-text-light bg-worldposta-primary hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-colors"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-sm text-center">
            <Link to={AppRoutes.ForgotPassword} className={linkClasses}>
              Forgot Password?
            </Link>
          </div>
          <div className="mt-3 text-sm text-center">
            <span className="text-brand-text-secondary dark:text-brand-text-light-secondary">Need an account? </span>
            <Link to={AppRoutes.SignUp} className={linkClasses}>
              Sign Up
            </Link>
          </div>
           <div className="mt-3 text-sm text-center">
            <Link to="#" className="font-medium text-brand-text-secondary hover:text-brand-text dark:text-brand-text-light-secondary dark:hover:text-brand-text-light hover:underline transition-colors">
              Having trouble signing in? Get Help.
            </Link>
          </div>
          
          {/* Powered by WorldPosta */}
          <p className="mt-10 text-xs text-brand-text-secondary dark:text-brand-text-light-secondary text-center">
            Powered by {COMPANY_NAME}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};
