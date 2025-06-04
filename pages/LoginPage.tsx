
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AppRoutes } from '../types';
import { EyeIcon, EyeSlashIcon, COMPANY_NAME, EmailAdminIcon, FolderOpenIcon, DashboardIcon, ShieldCheckIcon, CloudEdgeIcon, DocumentTextIcon } from '../constants';

// Simple Gear Icon for the new illustration
const GearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 1.905c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-1.905c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


// SSO Themed Vector Illustration
const LoginIllustration: React.FC = () => {
  const appNodeBaseClasses = "absolute bg-brand-bg-light dark:bg-brand-bg-dark-alt p-4 sm:p-5 rounded-xl shadow-xl flex items-center justify-center w-16 h-16 sm:w-[76px] sm:h-[76px]";
  const appNodeIconClasses = "w-7 h-7 sm:w-8 sm:h-8 text-worldposta-primary dark:text-worldposta-primary-light";

  return (
    <div className="relative w-full flex flex-col items-center justify-center animate-fadeIn" style={{ animationDelay: '200ms' }}>
      {/* Decorative Background Rings */}
      <div className="absolute w-[600px] h-[600px] sm:w-[700px] sm:h-[700px] bg-worldposta-primary/10 dark:bg-worldposta-primary/5 rounded-full opacity-30 -top-20 sm:-top-40 -left-10 sm:-left-20 blur-3xl z-0"></div>
      <div className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-sky-400/10 dark:bg-sky-600/5 rounded-full opacity-20 top-20 sm:top-40 left-10 sm:left-20 blur-2xl z-0"></div>

      {/* Illustration Container */}
      <div className="relative w-[400px] h-[400px] sm:w-[480px] sm:h-[480px] my-8 z-10">
        {/* Central Icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-worldposta-primary text-brand-text-light flex items-center justify-center shadow-xl">
          <ShieldCheckIcon className="w-12 h-12 sm:w-14 sm:h-14" />
        </div>

        {/* Application Nodes - 6 Node Layout */}
        {/* Node 1 (Top-Center) */}
        <div className={`${appNodeBaseClasses} top-0 left-1/2 transform -translate-x-1/2`}>
          <EmailAdminIcon className={appNodeIconClasses} />
        </div>
        {/* Node 2 (Top-Right) */}
        <div className={`${appNodeBaseClasses} top-[25%] right-0 transform -translate-y-1/2`}>
          <FolderOpenIcon className={appNodeIconClasses} />
        </div>
        {/* Node 3 (Bottom-Right) */}
        <div className={`${appNodeBaseClasses} bottom-[25%] right-0 transform translate-y-1/2`}>
          <DashboardIcon className={appNodeIconClasses} />
        </div>
        {/* Node 4 (Bottom-Center) */}
        <div className={`${appNodeBaseClasses} bottom-0 left-1/2 transform -translate-x-1/2`}>
          <CloudEdgeIcon className={appNodeIconClasses} /> {/* Using CloudEdge instead of Calendar */}
        </div>
        {/* Node 5 (Bottom-Left) */}
        <div className={`${appNodeBaseClasses} bottom-[25%] left-0 transform translate-y-1/2`}>
          <GearIcon className={appNodeIconClasses} />
        </div>
        {/* Node 6 (Top-Left) */}
        <div className={`${appNodeBaseClasses} top-[25%] left-0 transform -translate-y-1/2`}>
          <DocumentTextIcon className={appNodeIconClasses} /> {/* Using new DocumentTextIcon */}
        </div>
      </div>

      <div className="relative z-10 mt-12 sm:mt-14 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-worldposta-primary dark:text-worldposta-primary-light">
          Unified Access to Your WorldPosta Services
        </h2>
        <p className="text-sm sm:text-base text-brand-text-secondary dark:text-brand-text-light-secondary mt-2">
          One secure login for all your applications and tools.
        </p>
      </div>
    </div>
  );
};


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
  
  const inputClasses = "mt-1 block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark rounded-lg placeholder-brand-text-secondary placeholder-opacity-70 dark:placeholder-brand-text-light-secondary dark:placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:border-transparent sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark text-brand-text dark:text-brand-text-light transition-all duration-200 ease-in-out focus:shadow-md focus:shadow-worldposta-primary/30 dark:focus:shadow-worldposta-primary-light/20 focus:-translate-y-px";
  const linkClasses = "font-medium text-worldposta-primary dark:text-worldposta-primary-light hover:text-worldposta-primary-dark dark:hover:text-worldposta-primary-light dark:hover:opacity-80 hover:underline transition-colors";

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        .animate-fadeIn { animation: fadeInAnimation 0.8s ease-out forwards; }
        @keyframes fadeInAnimation { 
          from { opacity: 0; transform: translateY(20px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
      `}</style>
      <Header isLoggedIn={false} />
      <main className="flex-grow flex flex-col md:flex-row pt-16 bg-brand-bg-light-alt dark:bg-brand-bg-dark">

        {/* Left Column (Illustration) */}
        <div className="w-full md:w-3/5 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden order-1 
                        bg-gradient-to-r from-worldposta-primary-light via-worldposta-primary-light/60 to-brand-bg-light-alt 
                        dark:from-worldposta-primary/20 dark:via-worldposta-primary/10 dark:to-brand-bg-dark transition-all duration-500 ease-in-out">
          <LoginIllustration />
        </div>

        {/* Right Column (Login Form) */}
        <div className="w-full md:w-2/5 bg-brand-bg-light-alt dark:bg-brand-bg-dark flex flex-col items-center justify-center p-6 sm:p-12 order-2">
            <div className="hidden md:block text-center mb-8 animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <h2 className="text-xl font-semibold text-worldposta-primary dark:text-worldposta-primary-light">
                Unified Access to Your WorldPosta Services
              </h2>
            </div>
            <div className="w-full max-w-md bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl p-8 sm:p-10 transition-all duration-300 ease-in-out hover:shadow-2xl animate-fadeIn" style={{ animationDelay: '500ms' }}>
            <div className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-worldposta-primary dark:text-worldposta-primary-light">
                {COMPANY_NAME}
                </h1>
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
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-brand-text-light bg-worldposta-primary hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-all duration-200 ease-in-out transform hover:-translate-y-px hover:scale-[1.02] focus:scale-[1.02] active:scale-[0.98] hover:shadow-lg dark:hover:shadow-worldposta-primary/30"
                >
                    {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                    </span>
                    ) : (
                    'Sign In'
                    )}
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
            
            <p className="mt-12 text-xs text-brand-text-secondary dark:text-brand-text-light-secondary text-center">
                Powered by {COMPANY_NAME}
            </p>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
