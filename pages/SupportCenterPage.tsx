import React, { useState } from 'react';
import { SupportTicket } from '../types'; 
import { SupportIcon, HelpIcon } from '../constants';

const mockSupportTickets: SupportTicket[] = [
  { id: 'TKT-001', subject: 'Cannot access CloudVM dashboard', status: 'Open', lastUpdate: '2023-10-25', product: 'CloudEdge' },
  { id: 'TKT-002', subject: 'Email sending issues', status: 'Pending', lastUpdate: '2023-10-24', product: 'Email Admin Tool' },
  { id: 'TKT-003', subject: 'Billing query for INV-2023-001', status: 'Resolved', lastUpdate: '2023-10-20', product: 'General Billing' },
];

export const SupportCenterPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockSupportTickets);
  const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketProduct, setNewTicketProduct] = useState('CloudEdge');
  const [newTicketDescription, setNewTicketDescription] = useState('');


  const handleViewTicket = (ticketId: string) => {
    alert(`Viewing ticket ${ticketId} details (Simulated)`);
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newTicket: SupportTicket = {
        id: `TKT-${String(Date.now()).slice(-3)}`,
        subject: newTicketSubject,
        product: newTicketProduct,
        status: 'Open',
        lastUpdate: new Date().toISOString().split('T')[0]
    };
    setTickets(prev => [newTicket, ...prev]);
    alert('New support ticket created (Simulated)');
    setShowCreateTicketForm(false);
    setNewTicketSubject('');
    setNewTicketProduct('CloudEdge');
    setNewTicketDescription('');
  };

  const sectionClasses = "p-6 sm:p-8 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl";
  const headingClasses = "text-xl font-semibold text-brand-text dark:text-brand-text-light"; 
  const primaryButtonClasses = "px-5 py-2.5 bg-worldposta-primary text-brand-text-light font-semibold rounded-lg hover:bg-worldposta-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-70 transition-colors text-sm";
  const inputBaseClasses = "block w-full px-3.5 py-2.5 border border-brand-border dark:border-brand-border-dark rounded-lg placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark text-brand-text dark:text-brand-text-light";
  const labelBaseClasses = "block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1";
  const linkStyledButton = "text-worldposta-primary hover:text-worldposta-primary-dark dark:text-worldposta-primary-light dark:hover:text-worldposta-primary font-medium text-sm";


  return (
    <div className="space-y-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-light">Support Center</h1>

      <section className={sectionClasses}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-brand-border dark:border-brand-border-dark pb-4">
            <h2 className={headingClasses}>Create a New Support Ticket</h2>
            <button 
                onClick={() => setShowCreateTicketForm(!showCreateTicketForm)}
                className={`${primaryButtonClasses} mt-3 sm:mt-0`}
            >
                {showCreateTicketForm ? 'Cancel New Ticket' : 'Create New Ticket'}
            </button>
        </div>

        {showCreateTicketForm && (
            <form onSubmit={handleCreateTicketSubmit} className="space-y-5">
                 <div>
                    <label htmlFor="ticketSubject" className={labelBaseClasses}>Subject</label>
                    <input type="text" id="ticketSubject" value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)} required className={inputBaseClasses} placeholder="e.g., Unable to create new VM"/>
                </div>
                <div>
                    <label htmlFor="ticketProduct" className={labelBaseClasses}>Related Product/Service</label>
                    <select id="ticketProduct" value={newTicketProduct} onChange={e => setNewTicketProduct(e.target.value)} className={`${inputBaseClasses} appearance-none`}>
                        <option value="CloudEdge">CloudEdge</option>
                        <option value="Email Admin Tool">Email Admin Tool</option>
                        <option value="Billing">Billing</option>
                        <option value="Account">Account/SSO Platform</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="ticketDescription" className={labelBaseClasses}>Describe your issue in detail</label>
                    <textarea id="ticketDescription" value={newTicketDescription} onChange={e => setNewTicketDescription(e.target.value)} rows={5} required className={inputBaseClasses} placeholder="Please provide as much detail as possible..."/>
                </div>
                <button type="submit" className={`${primaryButtonClasses}`}>
                    Submit Ticket
                </button>
            </form>
        )}
      </section>

      <section className={sectionClasses}>
        <h2 className={`${headingClasses} mb-6 border-b border-brand-border dark:border-brand-border-dark pb-4`}>My Support Tickets</h2>
        {tickets.length > 0 ? (
        <div className="overflow-x-auto -mx-2">
          <table className="min-w-full divide-y divide-brand-border dark:divide-brand-border-dark">
            <thead className="bg-brand-bg-light-alt dark:bg-brand-bg-dark">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Ticket ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Subject</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Last Update</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary dark:text-brand-text-light-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-brand-bg-light dark:bg-brand-bg-dark-alt divide-y divide-brand-border dark:divide-brand-border-dark">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text dark:text-brand-text-light font-medium">{ticket.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary max-w-xs truncate" title={ticket.subject}>{ticket.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">{ticket.product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        ticket.status === 'Open' ? 'bg-blue-100 dark:bg-worldposta-primary dark:bg-opacity-30 text-blue-800 dark:text-blue-200' : 
                        ticket.status === 'Pending' ? 'bg-yellow-100 dark:bg-warning dark:bg-opacity-30 text-yellow-800 dark:text-yellow-200' : 
                        ticket.status === 'Resolved' ? 'bg-green-100 dark:bg-success dark:bg-opacity-30 text-green-800 dark:text-green-200' :
                        'bg-gray-100 dark:bg-brand-text-secondary dark:bg-opacity-30 text-gray-800 dark:text-gray-200' // Closed
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">{ticket.lastUpdate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                        onClick={() => handleViewTicket(ticket.id)}
                        className={linkStyledButton}
                    >
                        View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
            <p className="text-brand-text-secondary dark:text-brand-text-light-secondary text-sm">You have no active or past support tickets.</p>
        )}
      </section>

      <section className={sectionClasses}>
        <h2 className={`${headingClasses} mb-6 border-b border-brand-border dark:border-brand-border-dark pb-4`}>Knowledge Base & FAQs</h2>
        <p className="text-brand-text-secondary dark:text-brand-text-light-secondary mb-5 text-sm">
          Find answers to common questions, troubleshooting guides, and learn more about our services.
        </p>
        <div className="flex space-x-4">
            <a href="#" className={`${primaryButtonClasses} flex items-center space-x-2`}>
                <HelpIcon className="w-5 h-5" />
                <span>Visit Knowledge Base</span>
            </a>
        </div>
      </section>
    </div>
  );
};