import React from 'react';
import { useAuth } from '../App';
import { AppCard } from '../components/AppCard';
import { USER_APPLICATIONS } from '../constants';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-light mb-2">
          Welcome back, <span className="text-worldposta-primary dark:text-worldposta-primary-light">{user?.displayName || 'User'}</span>!
        </h1>
        <p className="text-lg text-brand-text-secondary dark:text-brand-text-light-secondary">
          Access your WorldPosta services from one place.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-light mb-5">My Applications</h2>
        {USER_APPLICATIONS.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {USER_APPLICATIONS.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-brand-bg-light dark:bg-brand-bg-dark-alt rounded-xl shadow-md">
            <p className="text-brand-text-secondary dark:text-brand-text-light-secondary text-lg">You don't have access to any applications yet.</p>
             <a href="#" className="mt-4 inline-block text-sm text-worldposta-primary hover:underline dark:text-worldposta-primary-light dark:hover:text-worldposta-primary">Request application access</a>
          </div>
        )}
      </section>

      {/* Optional: Quick Access / Recent Activity Section */}
      {/* <section>
        <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-light mb-4">Recent Activity</h2>
        <div className="bg-brand-bg-light dark:bg-brand-bg-dark-alt p-6 rounded-xl shadow-md">
          <p className="text-brand-text-secondary dark:text-brand-text-light-secondary">No recent activity to display.</p>
        </div>
      </section> */}

      {/* Optional: Account Overview Snippets */}
      {/* <section>
        <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-light mb-4">Account Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-bg-light dark:bg-brand-bg-dark-alt p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-lg text-brand-text dark:text-brand-text-light">CloudEdge</h3>
            <p className="text-brand-text-secondary dark:text-brand-text-light-secondary">3 Active VMs</p>
          </div>
          <div className="bg-brand-bg-light dark:bg-brand-bg-dark-alt p-6 rounded-xl shadow-md">
            <h3 className="font-semibold text-lg text-brand-text dark:text-brand-text-light">Billing</h3>
            <p className="text-brand-text-secondary dark:text-brand-text-light-secondary">Next invoice due: Oct 30, 2023</p>
          </div>
        </div>
      </section> */}
    </div>
  );
};