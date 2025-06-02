import React from 'react';
import { COMPANY_NAME } from '../constants';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-worldposta-footer-bg border-t border-worldposta-footer-border text-brand-text-light-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-sm mb-2">
          &copy; {currentYear} {COMPANY_NAME}. All rights reserved.
        </p>
        <div className="flex justify-center space-x-4">
          <a href="#" className="text-brand-text-light-secondary hover:text-worldposta-primary-light text-sm transition-colors">Privacy Policy</a>
          <a href="#" className="text-brand-text-light-secondary hover:text-worldposta-primary-light text-sm transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};