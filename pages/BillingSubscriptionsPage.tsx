
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Invoice } from '../types'; 
import { BillingIcon, EmailAdminIcon, CloudEdgeIcon } from '../constants'; 

const mockInvoices: Invoice[] = [
  { id: 'INV-2023-001', date: '2023-10-01', amount: '$50.00', status: 'Paid', service: 'CloudEdge Basic Plan' },
  { id: 'INV-2023-002', date: '2023-10-15', amount: '$25.00', status: 'Paid', service: 'Email Admin Pro' },
  { id: 'INV-2023-003', date: '2023-11-01', amount: '$50.00', status: 'Pending', service: 'CloudEdge Basic Plan' },
];

const mockPaymentMethods = [
    { id: 'pm_1', type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 'pm_2', type: 'MasterCard', last4: '5555', expiry: '06/24', isDefault: false },
];

export const BillingSubscriptionsPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [showAddSubscriptionModal, setShowAddSubscriptionModal] = useState(false);
  const navigate = useNavigate();

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId} (Simulated)`);
  };
  
  const handleAddPaymentMethod = () => {
    alert('Navigate to Add Payment Method flow (Simulated)');
  };

  const handleSetDefaultPaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === methodId })));
    alert(`Payment method ${methodId} set as default (Simulated)`);
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    if (paymentMethods.find(m => m.id === methodId && m.isDefault) && paymentMethods.length > 1) {
        alert("Cannot remove default payment method. Please set another method as default first.");
        return;
    }
    setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
    alert(`Payment method ${methodId} removed (Simulated)`);
  };

  const handleSelectNewSubscriptionType = (type: 'posta' | 'cloudedge') => {
    setShowAddSubscriptionModal(false);
    if (type === 'posta') {
        navigate('/app/billing/posta');
    } else if (type === 'cloudedge') {
        navigate('/app/billing/cloudedge');
    }
  };

  const sectionClasses = "p-6 sm:p-8 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl";
  const headingClasses = "text-xl font-semibold text-brand-text dark:text-brand-text-light border-b border-brand-border dark:border-brand-border-dark pb-4 mb-6";
  const primaryButtonClasses = "px-5 py-2.5 bg-worldposta-primary text-brand-text-light font-semibold rounded-lg hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-colors text-sm";
  const linkStyledButton = "text-worldposta-primary hover:text-worldposta-primary-dark dark:text-worldposta-primary-light dark:hover:text-worldposta-primary font-medium text-sm";
  const modalSelectionButtonClasses = "w-full flex items-center space-x-3 p-4 border border-brand-border dark:border-brand-border-dark rounded-lg hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark transition-colors";


  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-light">Billing & Subscriptions</h1>
        <button onClick={() => setShowAddSubscriptionModal(true)} className={`${primaryButtonClasses} mt-4 sm:mt-0`}>
            + Add New Subscription
        </button>
      </div>

      {showAddSubscriptionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-modalFadeInOverall">
            <div className="bg-brand-bg-light dark:bg-brand-bg-dark-alt p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeInContent">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-brand-text dark:text-brand-text-light">Add New Subscription</h2>
                    <button onClick={() => setShowAddSubscriptionModal(false)} className="text-brand-text-secondary dark:text-brand-text-light-secondary hover:text-brand-text dark:hover:text-brand-text-light text-2xl leading-none">&times;</button>
                </div>
                <p className="text-sm text-brand-text-secondary dark:text-brand-text-light-secondary mb-6">
                    Choose which WorldPosta product you'd like to subscribe to:
                </p>
                <div className="space-y-4">
                    <button 
                        onClick={() => handleSelectNewSubscriptionType('posta')}
                        className={modalSelectionButtonClasses}
                    >
                        <EmailAdminIcon className="w-8 h-8 text-worldposta-primary dark:text-worldposta-primary-light"/>
                        <div>
                            <span className="font-semibold text-brand-text dark:text-brand-text-light">Posta Email Solutions</span>
                            <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">Mailboxes, advanced rules, and more.</p>
                        </div>
                    </button>
                    <button 
                        onClick={() => handleSelectNewSubscriptionType('cloudedge')}
                        className={modalSelectionButtonClasses}
                    >
                        <CloudEdgeIcon className="w-8 h-8 text-worldposta-primary dark:text-worldposta-primary-light"/>
                         <div>
                            <span className="font-semibold text-brand-text dark:text-brand-text-light">CloudEdge Infrastructure</span>
                            <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">VMs, VDCs, and cloud resources.</p>
                        </div>
                    </button>
                </div>
                 <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes modalFadeInOverall { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes modalFadeInContent { from { opacity: 0; transform: scale(0.95) translateY(-20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                    .animate-modalFadeInOverall { animation: modalFadeInOverall 0.2s forwards ease-out; }
                    .animate-modalFadeInContent { animation: modalFadeInContent 0.3s forwards ease-out; }
                ` }} />
            </div>
        </div>
      )}


      <section className={sectionClasses}>
        <h2 className={headingClasses}>My Subscriptions</h2>
        <div className="space-y-6">
            <div className="p-5 border border-brand-border dark:border-brand-border-dark rounded-lg bg-brand-bg-light-alt dark:bg-brand-bg-dark">
                <h3 className="font-semibold text-lg text-brand-text dark:text-brand-text-light">CloudEdge Services</h3>
                <p className="text-sm text-brand-text-secondary dark:text-brand-text-light-secondary mt-1">Includes Pro Plan. Next payment: $75.00 on Dec 1, 2023</p>
                <Link to="/app/billing/cloudedge" className={`${linkStyledButton} mt-3 inline-block`}>Manage CloudEdge Subscriptions</Link>
            </div>
            <div className="p-5 border border-brand-border dark:border-brand-border-dark rounded-lg bg-brand-bg-light-alt dark:bg-brand-bg-dark">
                <h3 className="font-semibold text-lg text-brand-text dark:text-brand-text-light">Posta Email Services</h3>
                <p className="text-sm text-brand-text-secondary dark:text-brand-text-light-secondary mt-1">Includes Email Standard. Next payment: $25.00 on Nov 15, 2023</p>
                 <Link to="/app/billing/posta" className={`${linkStyledButton} mt-3 inline-block`}>Manage Posta Subscriptions</Link>
            </div>
        </div>
      </section>

      <section className={sectionClasses}>
        <h2 className={headingClasses}>Invoice History</h2>
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full divide-y divide-brand-border dark:divide-brand-border-dark">
            <thead className="bg-brand-bg-light-alt dark:bg-brand-bg-dark">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Invoice ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Service</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-brand-bg-light dark:bg-brand-bg-dark-alt divide-y divide-brand-border dark:divide-brand-border-dark">
              {invoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-brand-text-light font-medium">{invoice.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">{invoice.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">{invoice.service}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">{invoice.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'Paid' ? 'bg-green-100 dark:bg-success dark:bg-opacity-30 text-green-800 dark:text-green-200' : 
                        invoice.status === 'Pending' ? 'bg-yellow-100 dark:bg-warning dark:bg-opacity-30 text-yellow-800 dark:text-yellow-200' : 
                        'bg-red-100 dark:bg-danger dark:bg-opacity-30 text-red-800 dark:text-red-200' // Assuming warning color for 'Overdue' or similar
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                        onClick={() => handleDownloadInvoice(invoice.id)} 
                        className={linkStyledButton}
                    >
                        Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={sectionClasses}>
        <h2 className={headingClasses}>Payment Methods</h2>
         {paymentMethods.length > 0 ? (
          <ul className="space-y-4">
            {paymentMethods.map(method => (
              <li key={method.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-brand-bg-light-alt dark:bg-brand-bg-dark rounded-lg border border-brand-border dark:border-brand-border-dark hover:bg-opacity-80 dark:hover:bg-opacity-80 transition-colors">
                <div>
                  <p className="font-semibold text-brand-text dark:text-brand-text-light">{method.type} ending in {method.last4} 
                    {method.isDefault && <span className="ml-2 text-xs bg-green-100 dark:bg-success dark:bg-opacity-30 text-green-700 dark:text-green-200 px-2 py-0.5 rounded-full">Default</span>}
                  </p>
                  <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">Expires: {method.expiry}</p>
                </div>
                <div className="space-x-3 mt-2 sm:mt-0">
                    {!method.isDefault && (
                         <button 
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            className={`${linkStyledButton} hover:underline`}
                        >
                            Set as Default
                        </button>
                    )}
                    <button 
                        onClick={() => handleRemovePaymentMethod(method.id)}
                        className="text-danger hover:text-danger-dark dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                        Remove
                    </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-brand-text-secondary dark:text-brand-text-light-secondary text-sm">No payment methods on file.</p>
        )}
        <button 
          onClick={handleAddPaymentMethod}
          className={`${primaryButtonClasses} mt-6`}
        >
          Add New Payment Method
        </button>
      </section>
    </div>
  );
};