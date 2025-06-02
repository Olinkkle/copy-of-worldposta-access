import React, { useState }from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { AppRoutes } from '../types';
import { EyeIcon, EyeSlashIcon } from '../constants';


export const ProfileSettingsPage: React.FC = () => {
  const { user, logout } = useAuth(); 
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || ''); 
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (user) {
        console.log("Profile updated (simulated):", { displayName, companyName, phoneNumber });
    }
    setMessage({type: 'success', text: 'Profile updated successfully!'});
    setIsUpdatingProfile(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setMessage({type: 'error', text: 'New passwords do not match.'});
      return;
    }
    if (newPassword.length < 8) {
      setMessage({type: 'error', text: 'New password must be at least 8 characters long.'});
      return;
    }
    setIsUpdatingPassword(true);
    setMessage(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Password change attempt (simulated)");
    setMessage({type: 'success', text: 'Password changed successfully! If this were a real app, you might be signed out.'});
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setIsUpdatingPassword(false);
  };


  if (!user) {
    return (
      <div className="p-8 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl text-center">
        <p className="text-brand-text-secondary dark:text-brand-text-light-secondary mb-4">User not found. Please log in.</p>
        <Link to={AppRoutes.Login} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-brand-text-light bg-worldposta-primary hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt">
          Go to Login
        </Link>
      </div>
    );
  }
  
  const inputBaseClasses = "block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark rounded-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark-alt text-brand-text dark:text-brand-text-light";
  const labelBaseClasses = "block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1";
  const formSectionClasses = "p-6 sm:p-8 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl space-y-6";
  const buttonClasses = "px-5 py-2.5 bg-worldposta-primary text-brand-text-light font-semibold rounded-lg hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-colors";

  return (
    <div className="space-y-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-light">My Profile</h1>
      
      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 dark:bg-success dark:bg-opacity-20 text-success dark:text-green-300 border border-success dark:border-opacity-50' : 'bg-red-100 dark:bg-danger dark:bg-opacity-20 text-danger dark:text-red-300 border border-danger dark:border-opacity-50'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleProfileUpdate} className={formSectionClasses}>
        <h2 className="text-xl font-semibold text-brand-text dark:text-brand-text-light border-b border-brand-border dark:border-brand-border-dark pb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="displayName" className={labelBaseClasses}>Display Name</label>
              <input type="text" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputBaseClasses} />
            </div>
            <div>
              <label htmlFor="email" className={labelBaseClasses}>Email Address (Primary)</label>
              <input type="email" id="email" value={email} readOnly className={`${inputBaseClasses} bg-brand-bg-light-alt dark:bg-brand-bg-dark opacity-70 cursor-not-allowed`} />
            </div>
            <div>
              <label htmlFor="phoneNumber" className={labelBaseClasses}>Phone Number</label>
              <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputBaseClasses} placeholder="+1234567890" />
            </div>
            <div>
              <label htmlFor="companyName" className={labelBaseClasses}>Company Name</label>
              <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputBaseClasses} />
            </div>
        </div>
        <div>
          <button type="submit" disabled={isUpdatingProfile} className={buttonClasses}>
            {isUpdatingProfile ? 'Updating...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordChange} className={formSectionClasses}>
        <h2 className="text-xl font-semibold text-brand-text dark:text-brand-text-light border-b border-brand-border dark:border-brand-border-dark pb-4">Change Password</h2>
        
        <div>
          <label htmlFor="currentPassword" className={labelBaseClasses}>Current Password</label>
          <div className="relative mt-1">
            <input type={showCurrentPassword ? 'text' : 'password'} id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={inputBaseClasses} />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-text-secondary dark:text-brand-text-light-secondary" aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}>
              {showCurrentPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="newPassword" className={labelBaseClasses}>New Password</label>
           <div className="relative mt-1">
            <input type={showNewPassword ? 'text' : 'password'} id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputBaseClasses} placeholder="Minimum 8 characters" />
             <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-text-secondary dark:text-brand-text-light-secondary" aria-label={showNewPassword ? "Hide new password" : "Show new password"}>
              {showNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className={labelBaseClasses}>Confirm New Password</label>
          <div className="relative mt-1">
            <input type={showConfirmNewPassword ? 'text' : 'password'} id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className={inputBaseClasses} />
            <button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-text-secondary dark:text-brand-text-light-secondary" aria-label={showConfirmNewPassword ? "Hide confirm new password" : "Show confirm new password"}>
              {showConfirmNewPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <div>
          <button type="submit" disabled={isUpdatingPassword} className={buttonClasses}>
            {isUpdatingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};