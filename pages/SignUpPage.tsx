
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AppRoutes } from '../types';
import { EyeIcon, EyeSlashIcon, APP_NAME } from '../constants';

export const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("New user signed up:", { name, email, companyName });
    alert("Sign up successful! Please check your email to verify your account (simulated).");
    navigate(AppRoutes.Login);
    setIsLoading(false);
  };

  const inputBaseClasses = "mt-1 block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark rounded-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark-alt text-brand-text dark:text-brand-text-light";
  const labelBaseClasses = "block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1";
  const requiredMarker = <span className="text-danger dark:text-red-400 ml-1">*</span>;

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg-light dark:bg-brand-bg-dark"> {/* Page background */}
      <Header isLoggedIn={false} />
      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl p-8 sm:p-10"> {/* Card background */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-worldposta-primary dark:text-worldposta-primary-light">Create Your Account</h1>
            <p className="text-brand-text-secondary dark:text-brand-text-light-secondary mt-2">Join {APP_NAME} today!</p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-opacity-20 dark:bg-danger border border-danger dark:border-opacity-50 text-danger dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className={labelBaseClasses}>Full Name{requiredMarker}</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputBaseClasses} placeholder="John Doe"/>
            </div>
            <div>
              <label htmlFor="email" className={labelBaseClasses}>Email Address{requiredMarker}</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputBaseClasses} placeholder="you@example.com"/>
            </div>
            <div>
              <label htmlFor="companyName" className={labelBaseClasses}>Company Name (Optional)</label>
              <input id="companyName" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputBaseClasses} placeholder="Your Company Inc."/>
            </div>
            <div>
              <label htmlFor="password" className={labelBaseClasses}>Password{requiredMarker}</label>
              <div className="mt-1 relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className={inputBaseClasses} placeholder="Minimum 8 characters"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-brand-text-secondary dark:text-brand-text-light-secondary hover:text-brand-text dark:hover:text-brand-text-light transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
             <div>
              <label htmlFor="confirmPassword" className={labelBaseClasses}>Confirm Password{requiredMarker}</label>
              <div className="mt-1 relative">
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputBaseClasses} placeholder="Re-enter your password"/>
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-brand-text-secondary dark:text-brand-text-light-secondary hover:text-brand-text dark:hover:text-brand-text-light transition-colors" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-brand-text-light bg-worldposta-primary hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-colors">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-sm text-center">
            <span className="text-brand-text-secondary dark:text-brand-text-light-secondary">Already have an account? </span>
            <Link to={AppRoutes.Login} className="font-medium text-worldposta-primary hover:text-worldposta-primary-dark dark:hover:text-worldposta-primary-light transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
