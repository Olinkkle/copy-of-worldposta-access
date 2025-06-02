import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom'; 
import { useAuth } from '../App';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AppRoutes } from '../types';
import { APP_NAME } from '../constants';

export const MfaPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp === '123456') {
      auth.completeMfa(otp);
      navigate(AppRoutes.Dashboard, { replace: true });
    } else {
      setError('Invalid OTP. Please try again. (Hint: 123456)');
      setIsLoading(false);
    }
  };

  if (!auth.isMfaPending || !auth.user) {
    return <Navigate to={AppRoutes.Login} replace />;
  }
  
  const inputClasses = "mt-1 block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark rounded-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark-alt text-brand-text dark:text-brand-text-light text-center tracking-[0.3em] font-semibold text-lg";


  return (
    <div className="min-h-screen flex flex-col bg-brand-bg-light dark:bg-brand-bg-dark"> {/* Page background */}
      <Header isLoggedIn={false} /> 
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl p-8 sm:p-10"> {/* Card background */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-worldposta-primary dark:text-worldposta-primary-light">Two-Factor Authentication</h1>
            <p className="text-brand-text-secondary dark:text-brand-text-light-secondary mt-2 text-sm">
              Enter the 6-digit code from your authenticator app for <span className="font-medium text-brand-text dark:text-brand-text-light">{auth.user.email}</span>.
            </p>
          </div>

          {error && (
             <div className="bg-red-100 dark:bg-opacity-20 dark:bg-danger border border-danger dark:border-opacity-50 text-danger dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">
                Authentication Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                maxLength={6}
                className={inputClasses}
                placeholder="●●●●●●"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-brand-text-light bg-worldposta-primary hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-colors"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-sm text-center">
            <button onClick={() => auth.logout()} className="font-medium text-brand-text-secondary hover:text-brand-text dark:text-brand-text-light-secondary dark:hover:text-brand-text-light transition-colors">
              Cancel and Sign Out
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};