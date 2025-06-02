
import React, { useState, useMemo } from 'react';
import { ExternalLinkIcon } from '../constants';

interface Addon {
  id: string;
  name: string;
  priceMonthly: number;
  selected: boolean;
}

interface ConfigurableSubscriptionItem {
  configId: string;
  name: string;
  basePriceMonthly: number;
  features?: string[];
  quantity: number;
  duration: 'monthly' | 'yearly' | '3months' | '6months';
  addons: Addon[];
}

const POSTA_PLANS_DEFINITIONS_DATA = [
  { id: 'posta-basic', name: 'Posta Basic', basePriceMonthly: 5, features: ['10GB Mailbox', 'Anti-spam & Anti-virus', 'Webmail Access', 'Basic Email Support', 'Mobile Access (IMAP/POP3)', 'Custom Domain', 'Basic Aliases'], defaultAddons: [{ id: 'rules', name: 'Advanced Rules Engine', priceMonthly: 2, selected: false }] },
  { id: 'posta-standard', name: 'Posta Standard', basePriceMonthly: 10, features: ['25GB Mailbox', 'Anti-spam & Anti-virus', 'Shared Calendars & Contacts', 'Webmail Access', 'Priority Email Support', 'Mobile Sync (ActiveSync)', 'Advanced Aliases', 'Email Forwarding'], defaultAddons: [{ id: 'rules', name: 'Advanced Rules Engine', priceMonthly: 2, selected: false }] },
  { id: 'posta-premium', name: 'Posta Premium', basePriceMonthly: 15, features: ['50GB Mailbox', 'All Standard Features', 'Email Archiving (1 year)', 'Advanced Security Suite', 'Data Loss Prevention (Basic)', 'Dedicated IP Option', 'Multiple Domain Hosting', 'Enhanced Spam Filtering'], defaultAddons: [{ id: 'rules', name: 'Advanced Rules Engine', priceMonthly: 2, selected: false }] },
  { id: 'posta-enterprise', name: 'Posta Enterprise', basePriceMonthly: 25, features: ['100GB Mailbox', 'All Premium Features', 'Compliance Tools (HIPAA, GDPR ready)', 'Email Archiving (Unlimited)', 'eDiscovery', 'SLA Guarantee', '24/7 Premium Support', 'White-labeling Options', 'API Access'], defaultAddons: [{ id: 'rules', name: 'Advanced Rules Engine', priceMonthly: 2, selected: false }] },
];

const cloneAddons = (addons: Addon[]): Addon[] => addons.map(addon => ({ ...addon }));

const inputStyle = "block w-full px-3 py-2 border border-brand-border dark:border-brand-border-dark rounded-md focus:outline-none focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark text-brand-text dark:text-brand-text-light";
const buttonPrimaryStyle = "bg-worldposta-primary hover:bg-worldposta-primary-dark text-brand-text-light font-semibold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt";

export const ManagePostaSubscriptionPage: React.FC = () => {
  const [postaSubscriptions, setPostaSubscriptions] = useState<ConfigurableSubscriptionItem[]>(
    POSTA_PLANS_DEFINITIONS_DATA.map(p => ({
      configId: p.id, name: p.name, basePriceMonthly: p.basePriceMonthly, features: p.features, quantity: 0, duration: 'monthly', addons: cloneAddons(p.defaultAddons),
    }))
  );
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});

  const toggleFeaturesExpansion = (configId: string) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }));
  };

  const updateSubscription = (
    setter: React.Dispatch<React.SetStateAction<ConfigurableSubscriptionItem[]>>, configId: string, field: keyof ConfigurableSubscriptionItem, value: any
  ) => {
    setter(prevItems => prevItems.map(item => item.configId === configId ? { ...item, [field]: value } : item));
  };

  const updateAddonSelection = (
    setter: React.Dispatch<React.SetStateAction<ConfigurableSubscriptionItem[]>>, configId: string, addonId: string, selected: boolean
  ) => {
    setter(prevItems => prevItems.map(item => {
      if (item.configId === configId) {
        return { ...item, addons: item.addons.map(addon => addon.id === addonId ? { ...addon, selected } : addon) };
      }
      return item;
    }));
  };

  const calculateItemTotal = (item: ConfigurableSubscriptionItem): number => {
    if (item.quantity === 0) return 0;
    let monthlyPrice = item.basePriceMonthly;
    item.addons.forEach(addon => {
      if (addon.selected) monthlyPrice += addon.priceMonthly;
    });

    let multiplier = 1;
    if (item.duration === 'yearly') multiplier = 12 * 0.9; 
    else if (item.duration === '3months') multiplier = 3;
    else if (item.duration === '6months') multiplier = 6;
    
    return monthlyPrice * item.quantity * multiplier;
  };

  const summaryItems = useMemo(() => {
    return postaSubscriptions.filter(p => p.quantity > 0).map(p => ({
        name: p.name,
        quantity: p.quantity,
        duration: p.duration,
        total: calculateItemTotal(p)
    }));
  }, [postaSubscriptions]);

  const grandTotal = useMemo(() => summaryItems.reduce((acc, item) => acc + item.total, 0), [summaryItems]);

  const renderPostaSubscriptionConfig = (
    item: ConfigurableSubscriptionItem, setter: React.Dispatch<React.SetStateAction<ConfigurableSubscriptionItem[]>>
  ) => {
    const isExpanded = expandedFeatures[item.configId];
    const displayFeatures = item.features ? (isExpanded ? item.features : item.features.slice(0, 2)) : [];
    const hasMoreFeatures = item.features && item.features.length > 2;

    return (
      <div key={item.configId} className="p-4 border border-brand-border dark:border-brand-border-dark rounded-lg bg-brand-bg-light-alt dark:bg-brand-bg-dark space-y-3">
        <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-light">{item.name} - ${item.basePriceMonthly.toFixed(2)}/mo</h3>
        
        {item.features && item.features.length > 0 && (
          <div className="mb-2">
            <ul className="list-disc list-inside text-sm text-brand-text-secondary dark:text-brand-text-light-secondary space-y-0.5">
              {displayFeatures.map((feature, index) => (
                <li key={`${item.configId}-feature-${index}`}>{feature}</li>
              ))}
            </ul>
            {hasMoreFeatures && (
              <button
                onClick={() => toggleFeaturesExpansion(item.configId)}
                className="text-xs text-worldposta-primary dark:text-worldposta-primary-light hover:underline mt-1.5 focus:outline-none"
                aria-expanded={isExpanded}
              >
                {isExpanded ? 'See less' : `See ${item.features.length - 2} more feature${item.features.length - 2 > 1 ? 's' : ''}...`}
              </button>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-3">
          <div>
              <label htmlFor={`${item.configId}-qty`} className="block text-xs font-medium text-brand-text dark:text-brand-text-light">Quantity:</label>
              <input type="number" id={`${item.configId}-qty`} min="0" value={item.quantity} onChange={(e) => updateSubscription(setter, item.configId, 'quantity', parseInt(e.target.value) || 0)} className={`${inputStyle} w-24`} />
          </div>
          <div>
              <label htmlFor={`${item.configId}-duration`} className="block text-xs font-medium text-brand-text dark:text-brand-text-light">Duration:</label>
              <select id={`${item.configId}-duration`} value={item.duration} onChange={(e) => updateSubscription(setter, item.configId, 'duration', e.target.value as ConfigurableSubscriptionItem['duration'])} className={`${inputStyle} w-auto appearance-none`}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly (10% Disc.)</option>
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
              </select>
          </div>
        </div>
        {item.addons.length > 0 && (
          <div>
            <p className="text-xs font-medium text-brand-text dark:text-brand-text-light mb-1">Addons:</p>
            <div className="space-y-1">
              {item.addons.map(addon => (
                <label key={addon.id} className="flex items-center text-sm text-brand-text dark:text-brand-text-light">
                  <input type="checkbox" checked={addon.selected} onChange={(e) => updateAddonSelection(setter, item.configId, addon.id, e.target.checked)} className="h-4 w-4 text-worldposta-primary border-brand-border dark:border-brand-border-dark rounded mr-2 focus:ring-worldposta-primary focus:ring-offset-brand-bg-light-alt dark:focus:ring-offset-brand-bg-dark" />
                  {addon.name} (+${addon.priceMonthly.toFixed(2)}/mo)
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-light mb-8">
        Manage Posta Email Subscriptions
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-8">
          <section className="p-6 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-brand-border dark:border-brand-border-dark pb-4">
              <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-light mb-2 sm:mb-0">
                Available Posta Plans
              </h2>
              <a 
                href="https://worldposta.com/posta-pricing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm font-medium text-worldposta-primary dark:text-worldposta-primary-light hover:text-worldposta-primary-dark dark:hover:text-worldposta-primary transition-colors focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:ring-offset-2 dark:focus:ring-offset-brand-bg-dark-alt rounded-md px-3 py-1.5 border border-worldposta-primary hover:bg-worldposta-primary-light dark:hover:bg-worldposta-primary/10"
                aria-label="Compare Posta plans in a new tab"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                <span>Compare Plans</span>
              </a>
            </div>
            {postaSubscriptions.length === 0 && (
                <p className="text-brand-text-secondary dark:text-brand-text-light-secondary">No Posta plans configured. Contact support or check back later.</p>
            )}
            <div className="space-y-6">
              {postaSubscriptions.map(plan => renderPostaSubscriptionConfig(plan, setPostaSubscriptions))}
            </div>
             <p className="mt-6 text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">
                Configure quantities and durations for each Posta plan you need. Your selections will be summarized on the right.
            </p>
          </section>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-24 p-6 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl space-y-4">
            <h3 className="text-xl font-semibold text-brand-text dark:text-brand-text-light border-b border-brand-border dark:border-brand-border-dark pb-3 mb-3">
              Posta Subscription Summary
            </h3>
            {summaryItems.length === 0 && <p className="text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">No Posta items selected yet.</p>}
            {summaryItems.map(item => (
                <div key={item.name + item.duration} className="text-sm py-1 border-b border-brand-border dark:border-brand-border-dark last:border-b-0">
                    <div className="flex justify-between">
                        <span className="font-medium text-brand-text dark:text-brand-text-light">{item.name} (x{item.quantity})</span>
                        <span className="text-brand-text dark:text-brand-text-light">${item.total.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">Billed {item.duration.replace('months', ' Months').replace('yearly', 'Yearly (10% Disc.)').replace('monthly', 'Monthly')}</div>
                </div>
            ))}
            <div className="border-t border-brand-border dark:border-brand-border-dark pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-lg font-bold text-brand-text dark:text-brand-text-light">
                <span>Total for Posta:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <button className={`w-full mt-4 ${buttonPrimaryStyle}`} disabled={grandTotal === 0}>
              Update Posta Subscriptions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
