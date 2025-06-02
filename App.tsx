
import React, { useState, createContext, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { User, NavigationItem, AppRoutes } from './types';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MfaPage } from './pages/MfaPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { SecuritySettingsDashboardPage } from './pages/SecuritySettingsDashboardPage';
import { BillingSubscriptionsPage } from './pages/BillingSubscriptionsPage';
import { SupportCenterPage } from './pages/SupportCenterPage';
// import { ManageSubscriptionsPage } from './pages/ManageSubscriptionsPage'; // Removed
import { ManagePostaSubscriptionPage } from './pages/ManagePostaSubscriptionPage'; // Added
import { ManageCloudEdgeSubscriptionPage } from './pages/ManageCloudEdgeSubscriptionPage'; // Added
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { DASHBOARD_NAV_ITEMS, APP_NAME } from './constants';

interface AuthContextType {
  isAuthenticated: boolean;
  isMfaPending: boolean;
  user: User | null;
  login: (email: string, mfaRequired: boolean) => void;
  completeMfa: (otp: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isMfaPending } = useAuth();
  const location = useLocation();

  if (isMfaPending) {
    return <Navigate to={AppRoutes.Mfa} state={{ from: location }} replace />;
  }
  if (!isAuthenticated) {
    return <Navigate to={AppRoutes.Login} state={{ from: location }} replace />;
  }
  return <Outlet />;
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg-light-alt dark:bg-brand-bg-dark"> {/* Updated background */}
      <Header isLoggedIn={true} userName={user?.displayName} />
      <div className="flex flex-1 pt-16"> {/* Adjust pt-16 based on header height */}
        <Sidebar navItems={DASHBOARD_NAV_ITEMS} />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col min-h-screen bg-brand-bg-light-alt dark:bg-brand-bg-dark"> {/* Updated background */}
      <Header isLoggedIn={true} userName={user?.displayName} />
      <main className="flex-1 p-6 sm:p-8 pt-20 sm:pt-24 overflow-y-auto"> 
        {children}
      </main>
      {/* <Footer /> Optionally add footer to app pages */}
    </div>
  );
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mfaPending, setMfaPending] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const login = useCallback((email: string, mfaRequired: boolean) => {
    const fetchedUser: User = { 
      id: '1', 
      email: email, 
      displayName: email.split('@')[0] || 'User', 
      companyName: 'WorldPosta Corp', 
      avatarUrl: `https://i.pravatar.cc/100?u=${email}`
    };
    setCurrentUser(fetchedUser);
    if (mfaRequired) {
      setMfaPending(true);
    } else {
      setMfaPending(false);
    }
  }, []);

  const completeMfa = useCallback((otp: string) => {
    console.log('MFA OTP received:', otp);
    if (otp === '123456') { 
      setMfaPending(false);
    } else {
      alert('Invalid OTP. Try 123456.');
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setMfaPending(false);
  }, []);

  const isAuthenticated = !!currentUser && !mfaPending;


  const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-8 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl">
      <h1 className="text-3xl font-bold text-brand-text dark:text-brand-text-light mb-6">{title}</h1>
      <p className="text-brand-text-secondary dark:text-brand-text-light-secondary mb-6">This is a placeholder page for {title}. Content and functionality will be implemented here.</p>
      <Link to={AppRoutes.Dashboard} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-brand-text-light bg-worldposta-primary hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt">
        &larr; Back to Dashboard
      </Link>
    </div>
  );


  return (
    <AuthContext.Provider value={{ isAuthenticated, isMfaPending: mfaPending, user: currentUser, login, completeMfa, logout }}>
      <HashRouter>
        <Routes>
          <Route 
            path={AppRoutes.Login} 
            element={isAuthenticated ? <Navigate to={AppRoutes.Dashboard} /> : (mfaPending ? <Navigate to={AppRoutes.Mfa} /> : <LoginPage />)} 
          />
          <Route 
            path={AppRoutes.Mfa} 
            element={mfaPending && currentUser ? <MfaPage /> : <Navigate to={AppRoutes.Login} />} 
          />
          <Route path={AppRoutes.ForgotPassword} element={<ForgotPasswordPage />} />
          <Route path={AppRoutes.SignUp} element={<SignUpPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path={AppRoutes.Dashboard} element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
            <Route path={AppRoutes.Profile} element={<DashboardLayout><ProfileSettingsPage /></DashboardLayout>} />
            <Route path={AppRoutes.Security} element={<DashboardLayout><SecuritySettingsDashboardPage /></DashboardLayout>} />
            <Route path={AppRoutes.OrgManagement} element={<DashboardLayout><PlaceholderPage title="Organization Management" /></DashboardLayout>} />
            <Route path={AppRoutes.UserManagement} element={<DashboardLayout><PlaceholderPage title="User Management" /></DashboardLayout>} />
            <Route path={AppRoutes.PermissionGroups} element={<DashboardLayout><PlaceholderPage title="Permission Group Management" /></DashboardLayout>} />
            <Route path={AppRoutes.ActionLogs} element={<DashboardLayout><PlaceholderPage title="Action Logs" /></DashboardLayout>} />
            <Route path={AppRoutes.ResellerProgram} element={<DashboardLayout><PlaceholderPage title="Reseller Program" /></DashboardLayout>} /> {/* Added Reseller Program route */}
            
            <Route path="/app/billing" element={<AppLayout><BillingSubscriptionsPage /></AppLayout>} />
            <Route path="/app/support" element={<AppLayout><SupportCenterPage /></AppLayout>} />
            <Route path="/app/billing/posta" element={<AppLayout><ManagePostaSubscriptionPage /></AppLayout>} />
            <Route path="/app/billing/cloudedge" element={<AppLayout><ManageCloudEdgeSubscriptionPage /></AppLayout>} />
          </Route>
          <Route path="*" element={<Navigate to={isAuthenticated ? AppRoutes.Dashboard : AppRoutes.Login} />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;