
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Application } from '../types';

interface AppCardProps {
  app: Application;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const IconComponent = app.icon;
  const navigate = useNavigate();

  const handleLaunch = () => {
    if (app.url.startsWith('/')) {
      navigate(app.url);
    } else {
      alert(`Launching ${app.name}... (Opening external link: ${app.url})`);
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-brand-bg-light dark:bg-brand-bg-dark-alt rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col group">
      <div className="p-6 flex-grow">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-worldposta-primary-light dark:bg-worldposta-primary dark:bg-opacity-20 rounded-lg mr-4 group-hover:scale-105 transition-transform">
            <IconComponent className="w-8 h-8 text-worldposta-primary dark:text-worldposta-primary-light" />
          </div>
          <h3 className="text-xl font-semibold text-brand-text dark:text-brand-text-light">{app.name}</h3>
        </div>
        <p className="text-brand-text-secondary dark:text-brand-text-light-secondary text-sm mb-4 h-20 overflow-hidden line-clamp-4">
          {app.description}
        </p>
        {app.tags && app.tags.length > 0 && (
          <div className="mb-4">
            {app.tags.map(tag => (
              <span key={tag} className="inline-block bg-worldposta-primary-light dark:bg-worldposta-primary dark:bg-opacity-20 text-worldposta-primary dark:text-worldposta-primary-light rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-2">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-4 bg-brand-bg-light-alt dark:bg-brand-bg-dark dark:bg-opacity-50 border-t border-brand-border dark:border-brand-border-dark rounded-b-xl">
        <button
          onClick={handleLaunch}
          className="w-full bg-worldposta-primary hover:bg-worldposta-primary-dark text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt"
        >
          Launch Application
        </button>
      </div>
    </div>
  );
};