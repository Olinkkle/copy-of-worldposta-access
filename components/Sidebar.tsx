import React from 'react';
import { NavLink } from 'react-router-dom';
import { NavigationItem } from '../types';

interface SidebarProps {
  navItems: NavigationItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  return (
    <aside className="w-64 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-lg hidden md:block flex-shrink-0 border-r border-brand-border dark:border-brand-border-dark">
      <nav className="p-4 space-y-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 group
                   ${isActive 
                     ? 'bg-worldposta-primary text-brand-text-light shadow-sm' 
                     : 'text-brand-text-secondary dark:text-brand-text-light-secondary hover:bg-worldposta-primary-light dark:hover:bg-worldposta-primary dark:hover:bg-opacity-20 hover:text-worldposta-primary dark:hover:text-worldposta-primary-light'}`
                }
              >
                <item.icon className={`w-5 h-5 transition-colors ${item.path.includes("permission") ? 'transform -scale-x-100' : ''}`} />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};