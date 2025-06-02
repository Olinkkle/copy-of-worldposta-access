import React, { useState, useMemo, useCallback } from 'react';
import { VDCResourceControl } from '../components/VDCResourceControl';

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
  vmSpecs?: string;
  detailedConfig?: Record<string, { value: number; label: string; unit: string; pricePerUnit: number }>;
  quantity: number;
  addons: Addon[];
}

interface VDCResourceDefinition {
  id: string;
  label: string;
  unit: string;
  pricePerUnit: number;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

const VDC_RESOURCE_DEFINITIONS_DATA: VDCResourceDefinition[] = [
  { id: 'advBackup', label: 'Advanced Backup by Veeam', unit: 'GB', pricePerUnit: 1.20, min: 0, max: 100000, step: 10, defaultValue: 0 },
  { id: 'flashDisk', label: 'Flash Disk', unit: 'GB', pricePerUnit: 0.87, min: 0, max: 100000, step: 10, defaultValue: 50 },
  { id: 'objectStorage', label: 'Object Storage', unit: 'GB', pricePerUnit: 1.00, min: 0, max: 10240, step: 10, defaultValue: 0 },
  { id: 'ram', label: 'RAM', unit: 'GB', pricePerUnit: 60.00, min: 1, max: 3600, step: 1, defaultValue: 1 },
  { id: 'cores', label: 'Cores', unit: 'vCPU', pricePerUnit: 96.00, min: 1, max: 1000, step: 1, defaultValue: 1 },
  { id: 'trendMicro', label: 'Trend Micro Deep Security/ VM', unit: 'VM', pricePerUnit: 58.00, min: 0, max: 100, step: 1, defaultValue: 0 },
  { id: 'windowsLicenses', label: 'Windows Enterprise Licenses', unit: 'License', pricePerUnit: 1.00, min: 0, max: 100, step: 1, defaultValue: 0 },
  { id: 'linuxLicenses', label: 'Linux Enterprise Licenses', unit: 'License', pricePerUnit: 1.00, min: 0, max: 100, step: 1, defaultValue: 0 },
  { id: 'cortexXDR', label: 'Cortex XDR Endpoint Protection / VM', unit: 'VM', pricePerUnit: 900.00, min: 0, max: 100, step: 1, defaultValue: 0 },
  { id: 'publicIPs', label: 'Public IPs', unit: 'IP', pricePerUnit: 60.00, min: 0, max: 64, step: 1, defaultValue: 0 },
  { id: 'loadBalancerIP', label: 'Load Balancer/ IP', unit: 'IP', pricePerUnit: 240.00, min: 0, max: 64, step: 1, defaultValue: 0 },
];

const CLOUDEDGE_PREDEFINED_VMS_DATA = [
    { id: 'vm-small', name: 'VM Small', basePriceMonthly: 20, specs: '1 vCPU, 2GB RAM, 50GB SSD', defaultAddons: [{id: 'backup-basic', name: 'Basic Backup', priceMonthly: 5, selected: false}, {id: 'monitoring-std', name: 'Standard Monitoring', priceMonthly: 3, selected: false}] },
    { id: 'vm-medium', name: 'VM Medium', basePriceMonthly: 40, specs: '2 vCPU, 4GB RAM, 100GB SSD', defaultAddons: [{id: 'backup-basic', name: 'Basic Backup', priceMonthly: 5, selected: false}, {id: 'monitoring-std', name: 'Standard Monitoring', priceMonthly: 3, selected: false}] },
];
const CLOUDEDGE_PRECONFIGURED_VDCS_DATA = [
    { id: 'vdc-starter', name: 'VDC Starter', basePriceMonthly: 100, specs: '4 vCPU, 8GB RAM, 200GB SSD Pool', defaultAddons: [{id: 'adv-firewall', name: 'Advanced Firewall', priceMonthly: 15, selected: false}] },
];

const cloneAddons = (addons: Addon[]): Addon[] => addons.map(addon => ({ ...addon }));

const inputStyle = "block w-full px-3 py-2 border border-brand-border dark:border-brand-border-dark rounded-md focus:outline-none focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark text-brand-text dark:text-brand-text-light";
const buttonPrimaryStyle = "bg-worldposta-primary hover:bg-worldposta-primary-dark text-brand-text-light font-semibold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt";
const buttonSecondaryStyle = "bg-brand-bg-light-alt hover:bg-opacity-80 dark:bg-brand-bg-dark hover:dark:bg-opacity-80 border border-brand-border dark:border-brand-border-dark text-brand-text dark:text-brand-text-light font-semibold py-2 px-4 rounded-lg transition-colors";
const tabBaseStyle = "px-3 py-2 font-medium text-sm rounded-t-md";
const tabInactiveStyle = "text-brand-text-secondary dark:text-brand-text-light-secondary hover:text-worldposta-primary dark:hover:text-worldposta-primary-light";
const tabActiveStyle = "bg-worldposta-primary text-brand-text-light";


export const ManageCloudEdgeSubscriptionPage: React.FC = () => {
  const [cloudEdgePredefinedVMs, setCloudEdgePredefinedVMs] = useState<ConfigurableSubscriptionItem[]>(
    CLOUDEDGE_PREDEFINED_VMS_DATA.map(vm => ({
        configId: vm.id, name: vm.name, basePriceMonthly: vm.basePriceMonthly, vmSpecs: vm.specs, quantity: 0, addons: cloneAddons(vm.defaultAddons),
    }))
  );
  
  const [cloudEdgePreconfiguredVDCs, setCloudEdgePreconfiguredVDCs] = useState<ConfigurableSubscriptionItem[]>(
    CLOUDEDGE_PRECONFIGURED_VDCS_DATA.map(vdc => ({
        configId: vdc.id, name: vdc.name, basePriceMonthly: vdc.basePriceMonthly, vmSpecs: vdc.specs, quantity: 0, addons: cloneAddons(vdc.defaultAddons),
    }))
  );

  const [customVDCs, setCustomVDCs] = useState<ConfigurableSubscriptionItem[]>([]);
  const [cloudEdgeGlobalDuration, setCloudEdgeGlobalDuration] = useState<'monthly' | 'yearly' | '3months' | '6months'>('monthly');
  const [activeCloudEdgeTab, setActiveCloudEdgeTab] = useState<'predefinedVMs' | 'vdcs'>('predefinedVMs');
  const [activeVDCTab, setActiveVDCTab] = useState<'preconfigured' | 'custom'>('preconfigured');
  const [isCustomVDCModalOpen, setIsCustomVDCModalOpen] = useState(false);
  
  const initialVDCResourceValues = VDC_RESOURCE_DEFINITIONS_DATA.reduce((acc, res) => {
    acc[res.id] = res.defaultValue;
    return acc;
  }, {} as Record<string, number>);
  const [vdcResourceValues, setVDCResourceValues] = useState<Record<string, number>>(initialVDCResourceValues);

  const handleVDCResourceChange = useCallback((resourceId: string, value: number) => {
    setVDCResourceValues(prev => ({ ...prev, [resourceId]: value }));
  }, []);

  const vdcModalSummary = useMemo(() => {
    return VDC_RESOURCE_DEFINITIONS_DATA.map(resDef => {
      const value = vdcResourceValues[resDef.id] || 0;
      const cost = value * resDef.pricePerUnit;
      return {
        id: resDef.id,
        label: resDef.label,
        value: value,
        cost: cost,
        display: value > 0 || (resDef.id === 'flashDisk' || resDef.id === 'ram' || resDef.id === 'cores'), 
      };
    }).filter(item => item.display);
  }, [vdcResourceValues]);

  const vdcModalTotalPrice = useMemo(() => vdcModalSummary.reduce((total, item) => total + item.cost, 0), [vdcModalSummary]);

  const updateSubscriptionQuantity = (
    setter: React.Dispatch<React.SetStateAction<ConfigurableSubscriptionItem[]>>, configId: string, quantity: number
  ) => {
    setter(prevItems => prevItems.map(item => item.configId === configId ? { ...item, quantity } : item));
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
  
  const handleAddCustomVDC = () => {
      const detailedConfig: ConfigurableSubscriptionItem['detailedConfig'] = {};
      let specSummaryParts: string[] = [];
      VDC_RESOURCE_DEFINITIONS_DATA.forEach(def => {
          const value = vdcResourceValues[def.id];
          if (value > def.min || (def.id === 'flashDisk' || def.id === 'ram' || def.id === 'cores' && value >= def.min) ) { 
              detailedConfig[def.id] = { value, label: def.label, unit: def.unit, pricePerUnit: def.pricePerUnit };
              if (value > 0) { 
                specSummaryParts.push(`${value}${def.unit} ${def.label.split(' ')[0]}`);
              }
          }
      });
      const newCustomVDC: ConfigurableSubscriptionItem = {
          configId: generateId(),
          name: `Custom VDC #${customVDCs.length + 1}`,
          basePriceMonthly: vdcModalTotalPrice,
          vmSpecs: specSummaryParts.join(', ') || 'User Defined VDC (adjust resources)',
          detailedConfig,
          quantity: 1, 
          addons: [{id: 'adv-firewall-custom', name: 'Advanced Firewall', priceMonthly: 15, selected: false}, {id: 'backup-adv-custom', name: 'Advanced Backup', priceMonthly: 20, selected: false}],
      };
      setCustomVDCs(prev => [...prev, newCustomVDC]);
      setIsCustomVDCModalOpen(false);
      setVDCResourceValues(initialVDCResourceValues); 
  };

  const calculateItemTotal = (item: ConfigurableSubscriptionItem, globalDuration: 'monthly' | 'yearly' | '3months' | '6months'): number => {
    if (item.quantity === 0) return 0;
    let monthlyPrice = item.basePriceMonthly;
    item.addons.forEach(addon => { if (addon.selected) monthlyPrice += addon.priceMonthly; });
    let multiplier = 1;
    if (globalDuration === 'yearly') multiplier = 12 * 0.9; 
    else if (globalDuration === '3months') multiplier = 3;
    else if (globalDuration === '6months') multiplier = 6;
    return monthlyPrice * item.quantity * multiplier;
  };

  const summaryItems = useMemo(() => {
    const activeCloudEdgeServices = [
        ...cloudEdgePredefinedVMs,
        ...(activeCloudEdgeTab === 'vdcs' && activeVDCTab === 'preconfigured' ? cloudEdgePreconfiguredVDCs : []),
        ...(activeCloudEdgeTab === 'vdcs' && activeVDCTab === 'custom' ? customVDCs : []),
    ];
    return activeCloudEdgeServices.filter(s => s.quantity > 0).map(s => ({
        name: s.name,
        quantity: s.quantity,
        total: calculateItemTotal(s, cloudEdgeGlobalDuration)
    }));
  }, [cloudEdgePredefinedVMs, cloudEdgePreconfiguredVDCs, customVDCs, cloudEdgeGlobalDuration, activeCloudEdgeTab, activeVDCTab]);

  const grandTotal = useMemo(() => summaryItems.reduce((acc, item) => acc + item.total, 0), [summaryItems]);
  
  const renderCloudEdgeConfig = (
    item: ConfigurableSubscriptionItem, setter: React.Dispatch<React.SetStateAction<ConfigurableSubscriptionItem[]>>
  ) => (
    <div key={item.configId} className="p-4 border border-brand-border dark:border-brand-border-dark rounded-lg bg-brand-bg-light-alt dark:bg-brand-bg-dark space-y-3">
      <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-light">{item.name} - ${item.basePriceMonthly.toFixed(2)}/mo</h3>
      {item.vmSpecs && <p className="text-sm text-brand-text-secondary dark:text-brand-text-light-secondary mb-2">{item.vmSpecs}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <div>
            <label htmlFor={`${item.configId}-qty`} className="block text-xs font-medium text-brand-text dark:text-brand-text-light">Quantity:</label>
            <input type="number" id={`${item.configId}-qty`} min={item.detailedConfig ? 1: 0} value={item.quantity} onChange={(e) => updateSubscriptionQuantity(setter, item.configId, parseInt(e.target.value) || (item.detailedConfig ? 1 : 0))} className={`${inputStyle} w-24`} />
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-light mb-8">
        Manage CloudEdge Subscriptions
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-8">
           <section className="p-6 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl">
            <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-light mb-2 border-b border-brand-border dark:border-brand-border-dark pb-4">
              CloudEdge Infrastructure Configuration
            </h2>
            <div className="mb-6">
              <label htmlFor="cloudedge-duration" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Global Subscription Period for CloudEdge:</label>
               <select id="cloudedge-duration" value={cloudEdgeGlobalDuration} onChange={(e) => setCloudEdgeGlobalDuration(e.target.value as any)} className={`${inputStyle} w-full md:w-1/2 appearance-none`}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly (10% Disc.)</option>
                    <option value="3months">3 Months</option>
                    <option value="6months">6 Months</option>
                </select>
            </div>
             <div className="mb-4 border-b border-brand-border dark:border-brand-border-dark">
                <nav className="-mb-px flex space-x-1 sm:space-x-4" aria-label="Tabs">
                    <button onClick={() => setActiveCloudEdgeTab('predefinedVMs')} className={`${tabBaseStyle} ${activeCloudEdgeTab === 'predefinedVMs' ? tabActiveStyle : tabInactiveStyle}`}>Predefined VMs</button>
                    <button onClick={() => setActiveCloudEdgeTab('vdcs')} className={`${tabBaseStyle} ${activeCloudEdgeTab === 'vdcs' ? tabActiveStyle : tabInactiveStyle}`}>Virtual Data Centers (VDCs)</button>
                </nav>
            </div>
             {activeCloudEdgeTab === 'predefinedVMs' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-brand-text dark:text-brand-text-light mt-2">Select Predefined Virtual Machines</h3>
                    {cloudEdgePredefinedVMs.map(vm => renderCloudEdgeConfig(vm, setCloudEdgePredefinedVMs))}
                </div>
             )}
             {activeCloudEdgeTab === 'vdcs' && (
                <div className="space-y-4">
                    <div className="mb-3 border-b border-brand-border dark:border-brand-border-dark pb-3">
                        <nav className="-mb-px flex space-x-1 sm:space-x-4" aria-label="VDC Tabs">
                            <button onClick={() => setActiveVDCTab('preconfigured')} className={`${tabBaseStyle} text-xs sm:text-sm ${activeVDCTab === 'preconfigured' ? tabActiveStyle : tabInactiveStyle}`}>Preconfigured VDCs</button>
                            <button onClick={() => setActiveVDCTab('custom')} className={`${tabBaseStyle} text-xs sm:text-sm ${activeVDCTab === 'custom' ? tabActiveStyle : tabInactiveStyle}`}>Custom VDCs</button>
                        </nav>
                    </div>
                    {activeVDCTab === 'preconfigured' && (
                        <>
                            <h3 className="text-lg font-medium text-brand-text dark:text-brand-text-light mt-2">Select Preconfigured VDCs</h3>
                            {cloudEdgePreconfiguredVDCs.map(vdc => renderCloudEdgeConfig(vdc, setCloudEdgePreconfiguredVDCs))}
                        </>
                    )}
                    {activeVDCTab === 'custom' && (
                        <>
                          <h3 className="text-lg font-medium text-brand-text dark:text-brand-text-light mt-2">Your Custom VDCs</h3>
                          {customVDCs.length === 0 && <p className="text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">No custom VDCs configured yet.</p>}
                          {customVDCs.map(vdc => renderCloudEdgeConfig(vdc, setCustomVDCs))}
                          <button onClick={() => { setIsCustomVDCModalOpen(true); setVDCResourceValues(initialVDCResourceValues); }} className={`${buttonPrimaryStyle} mt-4`}>+ Configure New Custom VDC</button>
                        </>
                    )}
                </div>
             )}
          </section>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-24 p-6 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl space-y-4">
            <h3 className="text-xl font-semibold text-brand-text dark:text-brand-text-light border-b border-brand-border dark:border-brand-border-dark pb-3 mb-3">
              CloudEdge Subscription Summary
            </h3>
            {summaryItems.length === 0 && <p className="text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">No CloudEdge items selected yet.</p>}
            {summaryItems.map(item => (
                <div key={item.name} className="text-sm py-1 border-b border-brand-border dark:border-brand-border-dark last:border-b-0">
                    <div className="flex justify-between">
                        <span className="font-medium text-brand-text dark:text-brand-text-light">{item.name} (x{item.quantity})</span>
                        <span className="text-brand-text dark:text-brand-text-light">${item.total.toFixed(2)}</span>
                    </div>
                </div>
            ))}
            <div className="border-t border-brand-border dark:border-brand-border-dark pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-lg font-bold text-brand-text dark:text-brand-text-light">
                <span>Total for CloudEdge:</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
               <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">Billed {cloudEdgeGlobalDuration.replace('months', ' Months').replace('yearly', 'Yearly (10% Disc.)').replace('monthly', 'Monthly')}</p>
            </div>
            <button className={`w-full mt-4 ${buttonPrimaryStyle}`} disabled={grandTotal === 0}>
              Update CloudEdge Subscriptions
            </button>
          </div>
        </div>
      </div>
      
       {isCustomVDCModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out animate-modalFadeInOverall">
                <div className="bg-brand-bg-light dark:bg-brand-bg-dark-alt rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeInContent">
                    <div className="flex justify-between items-center p-4 sm:p-6 border-b border-brand-border dark:border-brand-border-dark">
                        <h2 className="text-xl sm:text-2xl font-semibold text-brand-text dark:text-brand-text-light">Build Custom Virtual Data Center</h2>
                        <button onClick={() => setIsCustomVDCModalOpen(false)} className="text-brand-text-secondary dark:text-brand-text-light-secondary hover:text-brand-text dark:hover:text-brand-text-light text-2xl leading-none">&times;</button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                            <div className="md:w-3/5 lg:w-2/3 space-y-1 pr-2 overflow-y-auto max-h-[calc(80vh-150px)] scrollbar-thin scrollbar-thumb-brand-border dark:scrollbar-thumb-brand-text-secondary scrollbar-track-brand-bg-light-alt dark:scrollbar-track-brand-bg-dark-alt">
                                {VDC_RESOURCE_DEFINITIONS_DATA.map(resDef => (
                                    <VDCResourceControl
                                        key={resDef.id}
                                        id={resDef.id}
                                        label={resDef.label}
                                        priceText={`$${resDef.pricePerUnit.toFixed(2)} / ${resDef.unit}`}
                                        min={resDef.min}
                                        max={resDef.max}
                                        step={resDef.step}
                                        value={vdcResourceValues[resDef.id] || resDef.defaultValue}
                                        unitLabel={!['VM', 'License', 'IP', 'vCPU'].includes(resDef.unit) ? resDef.unit : undefined}
                                        unitLabelForValue={resDef.unit}
                                        onChange={(value) => handleVDCResourceChange(resDef.id, value)}
                                    />
                                ))}
                            </div>
                            <div className="md:w-2/5 lg:w-1/3 md:sticky md:top-0 space-y-3 max-h-[calc(80vh-150px)] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-border dark:scrollbar-thumb-brand-text-secondary scrollbar-track-brand-bg-light-alt dark:scrollbar-track-brand-bg-dark-alt p-1">
                                <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-light border-b border-brand-border dark:border-brand-border-dark pb-2">Summary</h3>
                                {vdcModalSummary.length === 0 && <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">Configure resources to see summary.</p>}
                                {vdcModalSummary.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-xs py-1">
                                        <span className="text-brand-text dark:text-brand-text-light truncate pr-2" title={item.label}>{item.label}</span>
                                        <span className="text-brand-text-secondary dark:text-brand-text-light-secondary whitespace-nowrap">${item.cost.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="border-t border-brand-border dark:border-brand-border-dark pt-2 mt-2">
                                    <div className="flex justify-between text-md font-bold text-brand-text dark:text-brand-text-light">
                                        <span>Total Price:</span>
                                        <span>${vdcModalTotalPrice.toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">per month</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t border-brand-border dark:border-brand-border-dark">
                        <button onClick={() => setIsCustomVDCModalOpen(false)} className={`${buttonSecondaryStyle}`}>Cancel</button>
                        <button onClick={handleAddCustomVDC} className={`${buttonPrimaryStyle}`} disabled={vdcModalTotalPrice === 0 && VDC_RESOURCE_DEFINITIONS_DATA.some(def => def.min > 0 && (vdcResourceValues[def.id] || def.defaultValue) < def.min) }>Save Custom VDC</button>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes modalFadeInOverall { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes modalFadeInContent { from { opacity: 0; transform: scale(0.95) translateY(-20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                    .animate-modalFadeInOverall { animation: modalFadeInOverall 0.2s forwards ease-out; }
                    .animate-modalFadeInContent { animation: modalFadeInContent 0.3s forwards ease-out; }
                    .scrollbar-thin { scrollbar-width: thin; }
                    /* Webkit scrollbar styling for modal content */
                    .scrollbar-thumb-brand-border::-webkit-scrollbar-thumb { background-color: #E5E7EB; border-radius: 3px; } /* Light mode thumb */
                    .dark .scrollbar-thumb-brand-text-secondary::-webkit-scrollbar-thumb { background-color: #4B5563; border-radius: 3px; } /* Dark mode thumb */
                    .scrollbar-track-brand-bg-light-alt::-webkit-scrollbar-track { background-color: #F3F4F6; border-radius: 3px; } /* Light mode track */
                    .dark .scrollbar-track-brand-bg-dark-alt::-webkit-scrollbar-track { background-color: #374151; border-radius: 3px; } /* Dark mode track */
                    .max-h-\\[calc\\(80vh-150px\\)\\]::-webkit-scrollbar { width: 6px; height: 6px; }
                ` }} />
            </div>
        )}
    </div>
  );
};
