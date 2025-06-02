
import React, { useState } from 'react';
import { MfaMethod, LoginActivity } from '../types'; 
import { SecurityIcon, UserIcon } from '../constants'; 

const mockMfaMethods: MfaMethod[] = [
  { id: '1', type: 'Authenticator App', details: 'Google Authenticator', addedDate: '2023-01-15' },
  { id: '2', type: 'SMS', details: '***-***-1234', addedDate: '2023-03-20' },
];

const mockLoginActivity: LoginActivity[] = [
  { id: '1', date: '2023-10-26 10:00 AM', ipAddress: '192.168.1.100', location: 'New York, USA', device: 'Chrome on Windows' },
  { id: '2', date: '2023-10-25 08:30 PM', ipAddress: '203.0.113.45', location: 'London, UK', device: 'Safari on macOS' },
  { id: '3', date: '2023-10-24 09:15 AM', ipAddress: '198.51.100.12', location: 'Tokyo, Japan', device: 'Mobile App on Android' },
];

export const SecuritySettingsDashboardPage: React.FC = () => {
  const [mfaEnabled, setMfaEnabled] = useState(true); 
  const [mfaMethods, setMfaMethods] = useState<MfaMethod[]>(mockMfaMethods);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>(mockLoginActivity);

  const handleToggleMfa = () => {
    setMfaEnabled(!mfaEnabled);
    alert(`MFA ${!mfaEnabled ? 'Enabled' : 'Disabled'} (Simulated)`);
  };

  const handleAddMfaMethod = () => {
    alert('Navigate to Add MFA Method flow (Simulated)');
  };

  const handleRemoveMfaMethod = (methodId: string) => {
    if (mfaMethods.length <= 1 && mfaEnabled) {
        alert("You cannot remove the last MFA method while MFA is enabled. Please add another method first or disable MFA.");
        return;
    }
    setMfaMethods(prev => prev.filter(method => method.id !== methodId));
    alert(`MFA Method ${methodId} Removed (Simulated)`);
  };
  
  const sectionClasses = "p-6 sm:p-8 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl";
  const headingClasses = "text-xl font-semibold text-brand-text dark:text-brand-text-light border-b border-brand-border dark:border-brand-border-dark pb-4 mb-6";
  const primaryButtonClasses = "px-5 py-2.5 bg-worldposta-primary text-brand-text-light font-semibold rounded-lg hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-colors text-sm";


  return (
    <div className="space-y-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-light">Security Settings</h1>

      <section className={sectionClasses}>
        <h2 className={headingClasses}>Multi-Factor Authentication (MFA)</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <p className={`text-sm mb-3 sm:mb-0 ${mfaEnabled ? 'text-success dark:text-green-400' : 'text-danger dark:text-red-400'}`}>
            MFA is currently <strong>{mfaEnabled ? 'Enabled' : 'Disabled'}</strong> for your account.
          </p>
          <button
            onClick={handleToggleMfa}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-brand-text-light transition-colors ${mfaEnabled ? 'bg-danger hover:bg-danger-dark' : 'bg-success hover:bg-success-dark'}`}
          >
            {mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
          </button>
        </div>

        <h3 className="text-lg font-medium text-brand-text dark:text-brand-text-light mb-3">Registered MFA Methods</h3>
        {mfaMethods.length > 0 ? (
          <ul className="space-y-4">
            {mfaMethods.map(method => (
              <li key={method.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-brand-bg-light-alt dark:bg-brand-bg-dark rounded-lg border border-brand-border dark:border-brand-border-dark hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-colors">
                <div>
                  <p className="font-semibold text-brand-text dark:text-brand-text-light">{method.type}</p>
                  <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">Details: {method.details} (Added: {method.addedDate})</p>
                </div>
                <button 
                  onClick={() => handleRemoveMfaMethod(method.id)}
                  className="mt-2 sm:mt-0 text-danger hover:text-danger-dark dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-brand-text-secondary dark:text-brand-text-light-secondary text-sm">No MFA methods registered. Add one to enhance your account security.</p>
        )}
        <button 
          onClick={handleAddMfaMethod}
          className={`${primaryButtonClasses} mt-6`}
        >
          Add New MFA Method
        </button>
         <p className="mt-4 text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">
            Consider adding backup codes after setting up MFA for recovery purposes.
        </p>
      </section>

      <section className={sectionClasses}>
        <h2 className={headingClasses}>Recent Login Activity</h2>
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full divide-y divide-brand-border dark:divide-brand-border-dark">
            <thead className="bg-brand-bg-light-alt dark:bg-brand-bg-dark">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">IP Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Device/Client</th>
              </tr>
            </thead>
            <tbody className="bg-brand-bg-light dark:bg-brand-bg-dark-alt divide-y divide-brand-border dark:divide-brand-border-dark">
              {loginActivity.map(activity => (
                <tr key={activity.id} className="hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-brand-text-light">{activity.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">{activity.ipAddress}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">{activity.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">{activity.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         <p className="mt-4 text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">
            If you see any suspicious activity, please change your password immediately and contact support.
        </p>
      </section>

      <section className={sectionClasses}>
        <h2 className={headingClasses}>Active Sessions</h2>
        <p className="text-brand-text-secondary dark:text-brand-text-light-secondary text-sm">
          Functionality to view and revoke active SSO sessions will be available here. This allows you to see where your account is currently logged in and sign out of sessions remotely if needed.
        </p>
      </section>
    </div>
  );
};