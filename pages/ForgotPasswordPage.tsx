import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AppRoutes } from '../types';
import { APP_NAME } from '../constants';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMessage(`If an account exists for ${email}, a password reset link has been sent.`);
    setIsLoading(false);
    setEmail(''); 
  };

  const inputClasses = "mt-1 block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark rounded-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark-alt text-brand-text dark:text-brand-text-light";

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg-light dark:bg-brand-bg-dark"> {/* Page background */}
      <Header isLoggedIn={false} />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl p-8 sm:p-10"> {/* Card background */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-worldposta-primary dark:text-worldposta-primary-light">Forgot Your Password?</h1>
            <p className="text-brand-text-secondary dark:text-brand-text-light-secondary mt-2 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {message && (
            <div className="bg-green-100 dark:bg-opacity-20 dark:bg-success border border-success dark:border-opacity-50 text-success dark:text-green-300 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
              <span className="block sm:inline">{message}</span>
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-brand-text-light bg-worldposta-primary hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-colors"
              >
                {isLoading ? 'Sending Link...' : 'Send Password Reset Link'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-sm text-center">
            <Link to={AppRoutes.Login} className="font-medium text-worldposta-primary hover:text-worldposta-primary-dark dark:hover:text-worldposta-primary-light transition-colors">
              &larr; Back to Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};