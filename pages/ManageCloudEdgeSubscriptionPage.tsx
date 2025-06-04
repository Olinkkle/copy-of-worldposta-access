
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { VDCResourceControl } from '../components/VDCResourceControl';
import { Stepper } from '../components/Stepper'; // Import Stepper
import { 
    HelpIcon, 
    ExternalLinkIcon, 
    ChevronDownIcon,
    ArchiveBoxArrowDownIcon, // For Save Estimate
    FolderOpenIcon,          // For Load Estimate
    EnvelopeIcon,            // For Email Estimate
    DocumentArrowDownIcon    // For Download CSV
} from '../constants';

const generateId = () => `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface Addon {
  id: string;
  name: string;
  priceMonthly: number;
  selected: boolean;
}

interface VDCResourceDefinition {
  id: string;
  label: string;
  unit: string;
  pricePerUnit: number; // Base price, region/type multipliers applied dynamically
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  tooltip?: string;
}

// Updated CLOUD_EDGE_RESOURCE_DEFINITIONS
const CLOUD_EDGE_RESOURCE_DEFINITIONS: VDCResourceDefinition[] = [
  { id: 'cores', label: 'CPU Cores', unit: 'vCPU', pricePerUnit: 10.00, min: 1, max: 128, step: 1, defaultValue: 2, tooltip: "Virtual CPU cores for your instance or VDC." },
  { id: 'ram', label: 'RAM', unit: 'GB', pricePerUnit: 5.00, min: 1, max: 512, step: 1, defaultValue: 4, tooltip: "Random Access Memory for your instance or VDC." },
  { id: 'flashDisk', label: 'Flash Disk Storage / Boot Disk Size', unit: 'GB', pricePerUnit: 0.10, min: 10, max: 10240, step: 10, defaultValue: 50, tooltip: "Primary high-speed storage. For Instances, this is the Boot Disk size." },
  { id: 'staticPublicIPs', label: 'Static Public IPs', unit: 'IP', pricePerUnit: 4.00, min: 0, max: 64, step: 1, defaultValue: 0, tooltip: "Fixed IP addresses reserved for your use." },
  { id: 'objectStorage', label: 'Object Storage', unit: 'GB', pricePerUnit: 0.02, min: 0, max: 102400, step: 100, defaultValue: 0, tooltip: "Scalable storage for unstructured data." },
  { id: 'advBackup', label: 'Advanced Backup by Veeam', unit: 'GB', pricePerUnit: 0.05, min: 0, max: 100000, step: 50, defaultValue: 0, tooltip: "Backup storage managed by Veeam." },
  { id: 'trendMicro', label: 'Trend Micro Deep Security', unit: 'VM License', pricePerUnit: 15.00, min: 0, max: 100, step: 1, defaultValue: 0, tooltip: "Security licenses for Trend Micro Deep Security." },
  { id: 'windowsLicenses', label: 'Windows Server Licenses (Add-on)', unit: 'License', pricePerUnit: 20.00, min: 0, max: 100, step: 1, defaultValue: 0, tooltip: "Additional Windows Server licenses if not covered by OS selection." },
  { id: 'linuxLicenses', label: 'Linux Enterprise Licenses (Add-on)', unit: 'License', pricePerUnit: 10.00, min: 0, max: 100, step: 1, defaultValue: 0, tooltip: "Additional Enterprise Linux licenses if not covered by OS selection." },
  { id: 'cortexXDR', label: 'Cortex XDR Endpoint Protection', unit: 'Endpoint', pricePerUnit: 8.00, min: 0, max: 100, step: 1, defaultValue: 0, tooltip: "Palo Alto Networks Cortex XDR licenses." },
  { id: 'loadBalancerIP', label: 'Load Balancer Instance', unit: 'Instance', pricePerUnit: 18.00, min: 0, max: 10, step: 1, defaultValue: 0, tooltip: "Managed Load Balancer instances." },
];


const WORLDPOSTA_REGIONS = [
    { id: 'wp-us-east-1', name: 'WP US East (N. Virginia)', priceMultiplier: 1.0 },
    { id: 'wp-us-west-1', name: 'WP US West (Oregon)', priceMultiplier: 1.05 },
    { id: 'wp-eu-central-1', name: 'WP EU (Frankfurt)', priceMultiplier: 1.1 },
    { id: 'wp-apac-tokyo-1', name: 'WP APAC (Tokyo)', priceMultiplier: 1.15 },
];
const DEFAULT_REGION_ID = WORLDPOSTA_REGIONS[0].id;

const getDefaultAddons = (): Addon[] => [
    {id: 'adv-firewall', name: 'Advanced Firewall Service', priceMonthly: 25, selected: false},
    {id: 'enhanced-monitoring', name: 'Enhanced Monitoring Suite', priceMonthly: 10, selected: false}
];

const COMMITMENT_TERM_OPTIONS = [
    { id: 'monthly', name: 'Monthly', priceMultiplier: 1, discount: 0, suffix: "/mo" },
    { id: '3months', name: '3 Months', priceMultiplier: 3, discount: 0, suffix: "/3mo" },
    { id: '6months', name: '6 Months', priceMultiplier: 6, discount: 0, suffix: "/6mo" },
    { id: 'yearly', name: '1 Year (10% Disc.)', priceMultiplier: 12 * 0.9, discount: 0.10, suffix: "/yr" },
    { id: '3years', name: '3 Years (20% Disc.)', priceMultiplier: 36 * 0.8, discount: 0.20, suffix: "/3yr" },
];


type SubscriptionDuration = typeof COMMITMENT_TERM_OPTIONS[number]['id'];
type ServiceType = 'instance' | 'vdc';

// --- New Data Structures for Advanced Options ---
const OPERATING_SYSTEM_OPTIONS = [
    { id: 'wp-linux-std', name: 'WP Linux Standard (Free)', priceMonthly: 0, baseOsType: 'linux' },
    { id: 'wp-ubuntu-pro', name: 'WP Ubuntu Pro', priceMonthly: 5, baseOsType: 'linux', requiresLicenseResourceKey: 'linuxLicenses' },
    { id: 'wp-win-std', name: 'WP Windows Server Standard', priceMonthly: 15, baseOsType: 'windows', requiresLicenseResourceKey: 'windowsLicenses' },
    { id: 'wp-win-dc', name: 'WP Windows Server Datacenter', priceMonthly: 30, baseOsType: 'windows', requiresLicenseResourceKey: 'windowsLicenses' },
    { id: 'byol', name: 'Bring Your Own License (BYOL)', priceMonthly: 0, baseOsType: 'byol' },
];

const PROVISIONING_MODEL_OPTIONS = [
    { id: 'regular', name: 'Regular (On-demand)', priceMultiplier: 1.0 },
    { id: 'spot', name: 'Spot/Preemptible (Up to 70% Disc.)', priceMultiplier: 0.3 },
];

const BOOT_DISK_TYPE_OPTIONS = [
    { id: 'balanced-ssd', name: 'Balanced SSD', pricePerGBMultiplier: 1.0 }, // Baseline for flashDisk price
    { id: 'performance-ssd', name: 'Performance SSD', pricePerGBMultiplier: 1.5 },
    { id: 'standard-hdd', name: 'Standard HDD', pricePerGBMultiplier: 0.5 },
];

const GPU_TYPE_OPTIONS = [
    { id: 'wp-gpu-shared', name: 'GPU shared h100', priceMonthly: 150, compatibleSeries: ['wp-n-series', 'wp-c-series'] },
    { id: 'wp-gpu-dedicated', name: 'GPU Dedicated h100', priceMonthly: 400, compatibleSeries: ['wp-a-series'] },
];

const INSTANCE_TEMPLATE_OPTIONS = [
    { id: 'wp-gen-s1', name: 'WP General Small (S1)', resources: { cores: 2, ram: 4, flashDisk: 50 }, defaultOsId: 'wp-linux-std', defaultBootDiskTypeId: 'balanced-ssd', series: 'wp-n-series' },
    { id: 'wp-gen-m1', name: 'WP General Medium (M1)', resources: { cores: 4, ram: 16, flashDisk: 100 }, defaultOsId: 'wp-linux-std', defaultBootDiskTypeId: 'balanced-ssd', series: 'wp-n-series' },
    { id: 'wp-gen-l1', name: 'WP General Large (L1)', resources: { cores: 8, ram: 32, flashDisk: 200 }, defaultOsId: 'wp-linux-std', defaultBootDiskTypeId: 'balanced-ssd', series: 'wp-n-series' },
    { id: 'wp-comp-c1', name: 'WP Compute Optimized (C1)', resources: { cores: 4, ram: 8, flashDisk: 80 }, defaultOsId: 'wp-linux-std', defaultBootDiskTypeId: 'performance-ssd', series: 'wp-c-series' },
    { id: 'wp-mem-m1', name: 'WP Memory Optimized (M1)', resources: { cores: 2, ram: 32, flashDisk: 100 }, defaultOsId: 'wp-linux-std', defaultBootDiskTypeId: 'balanced-ssd', series: 'wp-m-series' },
];


interface CloudEdgeConfiguration {
  id: string;
  name: string;
  serviceType: ServiceType;
  resourceValues: Record<string, number>; 
  addons: Addon[];
  quantity: number;
  duration: SubscriptionDuration;
  region: string;
  // New fields from advanced config
  operatingSystemId: string;
  provisioningModel: typeof PROVISIONING_MODEL_OPTIONS[number]['id'];
  instanceTemplateId?: string; 
  bootDiskTypeId: typeof BOOT_DISK_TYPE_OPTIONS[number]['id'];
  confidentialVmEnabled: boolean;
  gpusEnabled: boolean;
  gpuTypeId?: typeof GPU_TYPE_OPTIONS[number]['id'];
  gpuCount?: number;
  advancedSettingsEnabled: boolean;
}

// SummaryItem type needs to be defined to be used in state
type SummaryItem = {
    id: string;
    name: string;
    serviceTypeName: string;
    quantity: number;
    regionName: string;
    details: string; // This was the full concatenated string, may need to rethink for modal
    coreResourcesSummary: string; // New for better display in modal
    otherResourcesList: { label: string; value: string }[]; // New for modal
    osSummary: string;
    provisioningSummary: string;
    gpuSummary: string;
    addonsSummary: string;
    monthlyPricePerUnit: number;
    totalCostForPeriod: number;
    billingCycleText: string;
    duration: SubscriptionDuration;
    instanceTemplateName?: string;
    bootDiskTypeName?: string;
    confidentialVmEnabled?: boolean;
};


const buttonPrimaryStyle = "bg-worldposta-primary hover:bg-worldposta-primary-dark text-brand-text-light font-semibold py-1.5 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-worldposta-primary dark:focus:ring-offset-brand-bg-dark-alt disabled:opacity-60";
const buttonSecondaryStyle = "bg-brand-bg-light-alt hover:bg-opacity-80 dark:bg-brand-bg-dark hover:dark:bg-opacity-80 border border-brand-border dark:border-brand-border-dark text-brand-text dark:text-brand-text-light font-semibold py-1.5 px-4 rounded-lg transition-colors";
const inputStyle = "block w-full px-3 py-2 border border-brand-border dark:border-brand-border-dark rounded-md focus:outline-none focus:ring-worldposta-primary focus:border-worldposta-primary sm:text-sm bg-brand-bg-light-alt dark:bg-brand-bg-dark text-brand-text dark:text-brand-text-light";
const iconButtonStyles = "p-2 rounded-md hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark focus:outline-none focus:ring-2 focus:ring-worldposta-primary focus:ring-offset-1 dark:focus:ring-offset-brand-bg-dark-alt transition-colors text-brand-text-secondary dark:text-brand-text-light-secondary";
const selectStyle = `${inputStyle} appearance-none pr-10`; // Added pr-10 for icon space


const CHECKOUT_STEPS = ["Order", "Checkout", "Confirmation"];


export const ManageCloudEdgeSubscriptionPage: React.FC = () => {
  const [configurations, setConfigurations] = useState<CloudEdgeConfiguration[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfiguration, setEditingConfiguration] = useState<CloudEdgeConfiguration | null>(null);

  // State for the new Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [configForDetailsModal, setConfigForDetailsModal] = useState<CloudEdgeConfiguration | null>(null);
  const [summaryItemForDetailsModal, setSummaryItemForDetailsModal] = useState<SummaryItem | null>(null);

  // Modal state variables
  const [currentModalConfigName, setCurrentModalConfigName] = useState('');
  const [currentModalServiceType, setCurrentModalServiceType] = useState<ServiceType>('instance');
  const [currentModalQuantity, setCurrentModalQuantity] = useState(1);
  const [currentModalRegion, setCurrentModalRegion] = useState<string>(DEFAULT_REGION_ID);
  const [currentModalDuration, setCurrentModalDuration] = useState<SubscriptionDuration>('monthly');
  const [currentModalResourceValues, setCurrentModalResourceValues] = useState<Record<string, number>>({});
  const [currentModalAddons, setCurrentModalAddons] = useState<Addon[]>(getDefaultAddons());
  
  // New advanced modal states
  const [currentModalOperatingSystemId, setCurrentModalOperatingSystemId] = useState<string>(OPERATING_SYSTEM_OPTIONS[0].id);
  const [currentModalProvisioningModel, setCurrentModalProvisioningModel] = useState<typeof PROVISIONING_MODEL_OPTIONS[number]['id']>(PROVISIONING_MODEL_OPTIONS[0].id);
  const [currentModalInstanceTemplateId, setCurrentModalInstanceTemplateId] = useState<string | undefined>(INSTANCE_TEMPLATE_OPTIONS[0].id);
  const [currentModalBootDiskTypeId, setCurrentModalBootDiskTypeId] = useState<string>(BOOT_DISK_TYPE_OPTIONS[0].id);
  const [currentModalConfidentialVmEnabled, setCurrentModalConfidentialVmEnabled] = useState<boolean>(false);
  const [currentModalGpusEnabled, setCurrentModalGpusEnabled] = useState<boolean>(false);
  const [currentModalGpuTypeId, setCurrentModalGpuTypeId] = useState<string | undefined>(GPU_TYPE_OPTIONS[0].id);
  const [currentModalGpuCount, setCurrentModalGpuCount] = useState<number>(0);
  const [currentModalAdvancedSettingsEnabled, setCurrentModalAdvancedSettingsEnabled] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const resetModalToDefaults = (isNew: boolean, configToLoad?: CloudEdgeConfiguration) => {
    const template = INSTANCE_TEMPLATE_OPTIONS[0];
    const defaultResources = CLOUD_EDGE_RESOURCE_DEFINITIONS.reduce((acc, def) => {
        acc[def.id] = def.defaultValue;
        return acc;
    }, {} as Record<string, number>);

    if (isNew || !configToLoad) {
        setCurrentModalConfigName(`Configuration #${configurations.length + 1}`);
        setCurrentModalServiceType('instance');
        setCurrentModalInstanceTemplateId(template.id); // Default template
        setCurrentModalResourceValues({ ...defaultResources, ...template.resources }); // Set resources from default template
        setCurrentModalOperatingSystemId(template.defaultOsId);
        setCurrentModalBootDiskTypeId(template.defaultBootDiskTypeId);
        setCurrentModalQuantity(1);
        setCurrentModalDuration('monthly');
        setCurrentModalRegion(DEFAULT_REGION_ID);
        setCurrentModalAddons(getDefaultAddons().map(a => ({...a})));
        setCurrentModalProvisioningModel(PROVISIONING_MODEL_OPTIONS[0].id);
        setCurrentModalConfidentialVmEnabled(false);
        setCurrentModalGpusEnabled(false);
        setCurrentModalGpuTypeId(GPU_TYPE_OPTIONS[0].id);
        setCurrentModalGpuCount(0);
        setCurrentModalAdvancedSettingsEnabled(false);
        setEditingConfiguration(null);
    } else {
        setCurrentModalConfigName(configToLoad.name);
        setCurrentModalServiceType(configToLoad.serviceType);
        setCurrentModalInstanceTemplateId(configToLoad.instanceTemplateId);
        setCurrentModalResourceValues({ ...configToLoad.resourceValues });
        setCurrentModalOperatingSystemId(configToLoad.operatingSystemId);
        setCurrentModalBootDiskTypeId(configToLoad.bootDiskTypeId);
        setCurrentModalQuantity(configToLoad.quantity);
        setCurrentModalDuration(configToLoad.duration);
        setCurrentModalRegion(configToLoad.region);
        setCurrentModalAddons(configToLoad.addons.map(a => ({...a})),
        );
        setCurrentModalProvisioningModel(configToLoad.provisioningModel);
        setCurrentModalConfidentialVmEnabled(configToLoad.confidentialVmEnabled);
        setCurrentModalGpusEnabled(configToLoad.gpusEnabled);
        setCurrentModalGpuTypeId(configToLoad.gpuTypeId);
        setCurrentModalGpuCount(configToLoad.gpuCount || 0);
        setCurrentModalAdvancedSettingsEnabled(configToLoad.advancedSettingsEnabled);
        setEditingConfiguration(configToLoad);
    }
  };
  
  useEffect(() => {
    if (currentModalServiceType === 'instance') {
        const selectedTemplate = INSTANCE_TEMPLATE_OPTIONS.find(t => t.id === currentModalInstanceTemplateId);
        if (selectedTemplate) {
            setCurrentModalResourceValues(prev => ({
                ...prev, 
                cores: selectedTemplate.resources.cores,
                ram: selectedTemplate.resources.ram,
                flashDisk: selectedTemplate.resources.flashDisk,
            }));
            setCurrentModalOperatingSystemId(selectedTemplate.defaultOsId);
            setCurrentModalBootDiskTypeId(selectedTemplate.defaultBootDiskTypeId);
        } else if (INSTANCE_TEMPLATE_OPTIONS.length > 0) { 
            const firstTemplate = INSTANCE_TEMPLATE_OPTIONS[0];
            setCurrentModalInstanceTemplateId(firstTemplate.id);
            setCurrentModalResourceValues(prev => ({
                ...prev,
                cores: firstTemplate.resources.cores,
                ram: firstTemplate.resources.ram,
                flashDisk: firstTemplate.resources.flashDisk,
            }));
            setCurrentModalOperatingSystemId(firstTemplate.defaultOsId);
            setCurrentModalBootDiskTypeId(firstTemplate.defaultBootDiskTypeId);
        }
    } else { 
        const defaultResources = CLOUD_EDGE_RESOURCE_DEFINITIONS.reduce((acc, def) => {
            if (['cores', 'ram', 'flashDisk'].includes(def.id)) {
                 acc[def.id] = currentModalResourceValues[def.id] || def.defaultValue;
            }
            return acc;
        }, {} as Record<string, number>);
        setCurrentModalResourceValues(prev => ({...prev, ...defaultResources}));
    }
  }, [currentModalServiceType, currentModalInstanceTemplateId]);

  useEffect(() => {
    if (currentModalGpusEnabled && currentModalGpuTypeId) {
        const selectedGpuDef = GPU_TYPE_OPTIONS.find(g => g.id === currentModalGpuTypeId);
        if (selectedGpuDef) {
            const maxGpu = selectedGpuDef.id === 'wp-gpu-shared' ? 8 : (selectedGpuDef.id === 'wp-gpu-dedicated' ? 7 : 1); 
            if (currentModalGpuCount === undefined || currentModalGpuCount === null || currentModalGpuCount < 1 || currentModalGpuCount > maxGpu) {
                setCurrentModalGpuCount(1); 
            }
        } else {
            setCurrentModalGpuCount(0);
        }
    } else {
        setCurrentModalGpuCount(0); 
    }
  }, [currentModalGpusEnabled, currentModalGpuTypeId, currentModalGpuCount]);


  useEffect(() => {
    handleLoadEstimateFromLocalStorage(false); 
  }, []); 

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const calculateMonthlyPriceForSingleUnit = useCallback((
    resourceValues: Record<string, number>, 
    addons: Addon[], 
    regionId: string,
    provisioningModel: typeof PROVISIONING_MODEL_OPTIONS[number]['id'],
    operatingSystemId: string,
    bootDiskTypeId: string,
    gpusEnabled: boolean,
    gpuTypeId?: string,
    gpuCount?: number
  ): number => {
    let price = 0;
    const region = WORLDPOSTA_REGIONS.find(r => r.id === regionId) || WORLDPOSTA_REGIONS[0];
    const regionPriceMultiplier = region.priceMultiplier;
    const provModel = PROVISIONING_MODEL_OPTIONS.find(pm => pm.id === provisioningModel) || PROVISIONING_MODEL_OPTIONS[0];
    const os = OPERATING_SYSTEM_OPTIONS.find(os => os.id === operatingSystemId);
    const bootDiskType = BOOT_DISK_TYPE_OPTIONS.find(bdt => bdt.id === bootDiskTypeId) || BOOT_DISK_TYPE_OPTIONS[0];

    CLOUD_EDGE_RESOURCE_DEFINITIONS.forEach(def => {
      let value = resourceValues[def.id] || 0;
      let unitPrice = def.pricePerUnit * regionPriceMultiplier;
      
      if (def.id === 'flashDisk') { 
        unitPrice *= bootDiskType.pricePerGBMultiplier;
      }
      price += value * unitPrice;
    });

    if (os && os.priceMonthly) {
        price += os.priceMonthly; 
    }

    if (gpusEnabled && gpuTypeId && gpuCount && gpuCount > 0) {
        const gpu = GPU_TYPE_OPTIONS.find(g => g.id === gpuTypeId);
        if (gpu) {
            price += gpu.priceMonthly * gpuCount;
        }
    }
    
    addons.forEach(addon => {
      if (addon.selected) price += addon.priceMonthly; 
    });

    price *= provModel.priceMultiplier; 

    return price;
  }, []);

  const getDurationInfo = (durationId: SubscriptionDuration) => {
    return COMMITMENT_TERM_OPTIONS.find(opt => opt.id === durationId) || COMMITMENT_TERM_OPTIONS[0];
  };

  const openModalForNew = () => {
    resetModalToDefaults(true);
    setIsModalOpen(true);
  };

  const openModalForEdit = (config: CloudEdgeConfiguration, duplicate = false) => {
    resetModalToDefaults(false, config);
    if (duplicate) {
        setCurrentModalConfigName(`Copy of ${config.name}`);
        setEditingConfiguration(null); 
    }
    setIsModalOpen(true);
  };
  
  const handleDuplicateConfiguration = (configId: string) => {
    const configToDuplicate = configurations.find(c => c.id === configId);
    if (configToDuplicate) {
      openModalForEdit(configToDuplicate, true);
    }
  };
  
  const handleModalResourceChange = useCallback((resourceId: string, value: number) => {
    setCurrentModalResourceValues(prev => ({ ...prev, [resourceId]: value }));
  }, []);

  const handleModalAddonToggle = (addonId: string) => {
    setCurrentModalAddons(prevAddons => 
        prevAddons.map(addon => addon.id === addonId ? {...addon, selected: !addon.selected} : addon)
    );
  };

  const handleSaveConfiguration = () => {
    const newOrUpdatedConfig: CloudEdgeConfiguration = {
      id: editingConfiguration?.id || generateId(),
      name: currentModalConfigName || `Configuration ${configurations.length +1}`,
      serviceType: currentModalServiceType,
      resourceValues: { ...currentModalResourceValues },
      addons: currentModalAddons.map(a => ({...a})),
      quantity: currentModalQuantity >= 1 ? currentModalQuantity : 1,
      duration: currentModalDuration,
      region: currentModalRegion,
      operatingSystemId: currentModalOperatingSystemId,
      provisioningModel: currentModalProvisioningModel,
      instanceTemplateId: currentModalServiceType === 'instance' ? currentModalInstanceTemplateId : undefined,
      bootDiskTypeId: currentModalBootDiskTypeId,
      confidentialVmEnabled: currentModalConfidentialVmEnabled,
      gpusEnabled: currentModalGpusEnabled,
      gpuTypeId: currentModalGpusEnabled ? currentModalGpuTypeId : undefined,
      gpuCount: currentModalGpusEnabled ? (currentModalGpuCount || 0) : 0,
      advancedSettingsEnabled: currentModalAdvancedSettingsEnabled,
    };

    if (editingConfiguration) {
      setConfigurations(prev => prev.map(c => c.id === editingConfiguration.id ? newOrUpdatedConfig : c));
      showToast(`Configuration "${newOrUpdatedConfig.name}" updated.`);
    } else {
      setConfigurations(prev => [...prev, newOrUpdatedConfig]);
      showToast(`Configuration "${newOrUpdatedConfig.name}" added.`);
    }
    setIsModalOpen(false);
    setEditingConfiguration(null);
  };

  const removeConfiguration = (configId: string) => {
    const configToRemove = configurations.find(c => c.id === configId);
    if (window.confirm(`Are you sure you want to remove configuration: "${configToRemove?.name || 'this configuration'}"?`)) {
        setConfigurations(prev => prev.filter(c => c.id !== configId));
        showToast(`Configuration "${configToRemove?.name}" removed.`);
    }
  };

  const currentModalMonthlyPricePerUnit = useMemo(() => {
    return calculateMonthlyPriceForSingleUnit(
        currentModalResourceValues, 
        currentModalAddons, 
        currentModalRegion,
        currentModalProvisioningModel,
        currentModalOperatingSystemId,
        currentModalBootDiskTypeId,
        currentModalGpusEnabled,
        currentModalGpuTypeId,
        currentModalGpuCount
    );
  }, [
    currentModalResourceValues, currentModalAddons, currentModalRegion, 
    currentModalProvisioningModel, currentModalOperatingSystemId, currentModalBootDiskTypeId,
    currentModalGpusEnabled, currentModalGpuTypeId, currentModalGpuCount,
    calculateMonthlyPriceForSingleUnit
  ]);


  const summaryItems: SummaryItem[] = useMemo(() => {
    return configurations.map(config => {
      const monthlyPricePerUnit = calculateMonthlyPriceForSingleUnit(
        config.resourceValues, config.addons, config.region,
        config.provisioningModel, config.operatingSystemId, config.bootDiskTypeId,
        config.gpusEnabled, config.gpuTypeId, config.gpuCount
      );
      const durationInfo = getDurationInfo(config.duration);
      const totalCostForPeriod = monthlyPricePerUnit * config.quantity * durationInfo.priceMultiplier;
      const regionName = WORLDPOSTA_REGIONS.find(r => r.id === config.region)?.name || config.region;
      const serviceTypeName = config.serviceType === 'vdc' ? 'Virtual Data Center' : 'Instance';
      const os = OPERATING_SYSTEM_OPTIONS.find(os => os.id === config.operatingSystemId);
      const provModel = PROVISIONING_MODEL_OPTIONS.find(pm => pm.id === config.provisioningModel);
      const gpu = GPU_TYPE_OPTIONS.find(g => g.id === config.gpuTypeId);
      const instanceTemplate = INSTANCE_TEMPLATE_OPTIONS.find(it => it.id === config.instanceTemplateId);
      const bootDiskType = BOOT_DISK_TYPE_OPTIONS.find(bdt => bdt.id === config.bootDiskTypeId);

      const coreResourcesSummary = CLOUD_EDGE_RESOURCE_DEFINITIONS
        .filter(def => ['cores', 'ram', 'flashDisk'].includes(def.id))
        .map(def => `${config.resourceValues[def.id]}${def.unit} ${def.label.split(" ")[0]}`)
        .join(' / ');
      
      const otherResourcesList = CLOUD_EDGE_RESOURCE_DEFINITIONS
        .filter(def => !['cores', 'ram', 'flashDisk'].includes(def.id) && (config.resourceValues[def.id] > 0 || (def.min > 0 && config.resourceValues[def.id] === def.min)))
        .map(def => ({ label: def.label, value: `${config.resourceValues[def.id]} ${def.unit}` }));

      return {
        id: config.id,
        name: config.name,
        serviceTypeName,
        quantity: config.quantity,
        regionName,
        coreResourcesSummary,
        otherResourcesList,
        details: '', // Keep for compatibility, not used in condensed summary
        osSummary: `OS: ${os?.name || 'N/A'}`,
        provisioningSummary: `Model: ${provModel?.name || 'N/A'}`,
        gpuSummary: config.gpusEnabled && config.gpuCount && config.gpuCount > 0 && gpu 
          ? `GPUs: ${config.gpuCount}x ${gpu.name}`
          : 'GPUs: No GPUs',
        addonsSummary: config.addons.filter(a => a.selected).map(a => a.name).join(', ') || 'None',
        monthlyPricePerUnit: monthlyPricePerUnit,
        totalCostForPeriod: totalCostForPeriod,
        billingCycleText: durationInfo.name,
        duration: config.duration,
        instanceTemplateName: instanceTemplate?.name,
        bootDiskTypeName: bootDiskType?.name,
        confidentialVmEnabled: config.confidentialVmEnabled,
      };
    });
  }, [configurations, calculateMonthlyPriceForSingleUnit]);

  const grandTotalForPeriod = useMemo(() => {
    return summaryItems.reduce((acc, item) => acc + item.totalCostForPeriod, 0);
  }, [summaryItems]);

 const handleSaveEstimateToLocalStorage = () => {
    try {
      const serializedConfigs = configurations.map(config => ({
        ...config,
        instanceTemplateId: config.instanceTemplateId || undefined, 
        gpuTypeId: config.gpuTypeId || undefined,
        gpuCount: config.gpuCount || 0, 
      }));
      localStorage.setItem('worldpostaCloudEdgeEstimate', JSON.stringify(serializedConfigs));
      showToast('Estimate saved successfully!');
    } catch (error) {
      console.error("Error saving estimate to localStorage:", error);
      showToast('Error saving estimate.');
    }
  };

  const handleLoadEstimateFromLocalStorage = (showSuccessToast = true) => {
    try {
      const savedEstimate = localStorage.getItem('worldpostaCloudEdgeEstimate');
      if (savedEstimate) {
        const parsedConfigurations: Partial<CloudEdgeConfiguration>[] = JSON.parse(savedEstimate);
        if (Array.isArray(parsedConfigurations)) {
            const migratedConfigurations = parsedConfigurations.map(config => {
                const template = INSTANCE_TEMPLATE_OPTIONS[0]; 
                const defaultResources = CLOUD_EDGE_RESOURCE_DEFINITIONS.reduce((acc, def) => {
                    acc[def.id] = def.defaultValue;
                    return acc;
                }, {} as Record<string, number>);

                return {
                    id: config.id || generateId(),
                    name: config.name || 'Unnamed Configuration',
                    serviceType: config.serviceType || 'instance',
                    resourceValues: { ...defaultResources, ...(config.resourceValues || {}) },
                    addons: Array.isArray(config.addons) ? config.addons.map(a => ({...a})) : getDefaultAddons().map(a => ({...a})),
                    quantity: config.quantity || 1,
                    duration: config.duration || 'monthly',
                    region: config.region || DEFAULT_REGION_ID,
                    operatingSystemId: config.operatingSystemId || OPERATING_SYSTEM_OPTIONS[0].id,
                    provisioningModel: config.provisioningModel || PROVISIONING_MODEL_OPTIONS[0].id,
                    instanceTemplateId: config.instanceTemplateId || (config.serviceType === 'instance' ? template.id : undefined),
                    bootDiskTypeId: config.bootDiskTypeId || BOOT_DISK_TYPE_OPTIONS[0].id,
                    confidentialVmEnabled: config.confidentialVmEnabled || false,
                    gpusEnabled: config.gpusEnabled || false,
                    gpuTypeId: config.gpuTypeId || (config.gpusEnabled ? GPU_TYPE_OPTIONS[0].id : undefined),
                    gpuCount: config.gpuCount || 0,
                    advancedSettingsEnabled: config.advancedSettingsEnabled || false,
                } as CloudEdgeConfiguration; 
            });
            setConfigurations(migratedConfigurations);
            if (showSuccessToast) showToast('Estimate loaded successfully!');
        } else {
            if (showSuccessToast) showToast('Could not load estimate: Invalid format.');
            localStorage.removeItem('worldpostaCloudEdgeEstimate'); 
        }
      } else {
        if (showSuccessToast) showToast('No saved estimate found.');
      }
    } catch (error) {
      console.error("Error loading estimate from localStorage:", error);
      if (showSuccessToast) showToast('Error loading estimate.');
      localStorage.removeItem('worldpostaCloudEdgeEstimate'); 
    }
  };
  
  const handleClearEstimate = () => {
    if (window.confirm("Are you sure you want to clear the current estimate? This cannot be undone if not saved.")) {
      setConfigurations([]);
      localStorage.removeItem('worldpostaCloudEdgeEstimate'); 
      showToast('Estimate cleared.');
    }
  };

  const handleEmailEstimate = () => {
    const subject = "WorldPosta CloudEdge Estimate";
    let body = "Here is my WorldPosta CloudEdge Estimate:\n\n";
    summaryItems.forEach(item => {
      body += `Configuration: ${item.name} (x${item.quantity}) - Type: ${item.serviceTypeName}\n`;
      body += ` Region: ${item.regionName}\n`;
      body += ` ${item.osSummary} | ${item.provisioningSummary} | ${item.gpuSummary}\n`;
      body += ` Core Resources: ${item.coreResourcesSummary}\n`;
      if (item.otherResourcesList.length > 0) {
        body += ` Other Resources: ${item.otherResourcesList.map(r => `${r.value} ${r.label}`).join(', ')}\n`;
      }
      if (item.addonsSummary !== 'None') body += ` Addons: ${item.addonsSummary}\n`;
      body += ` Billing: ${item.billingCycleText}\n`;
      body += ` Cost: $${item.totalCostForPeriod.toFixed(2)}\n\n`;
    });
    body += `Grand Total: $${grandTotalForPeriod.toFixed(2)}\n\n`;
    body += "This estimate was generated using the WorldPosta CloudEdge Calculator.\n";
    body += `\nTo view/edit this estimate online (if saved locally by sender):\n${window.location.href}`; 

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    showToast('Estimate ready to be emailed. Please check your email client.');
  };

  const handleDownloadCSV = () => {
    if (summaryItems.length === 0) {
      showToast("No items in the estimate to download.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Config Name,Service Type,Qty,Region,OS,Prov. Model,GPUs,Core Resources,Other Resources,Addons,Unit Monthly Price,Billing Cycle,Total Cost\n";
    summaryItems.forEach(item => {
      const otherResourcesText = item.otherResourcesList.map(r => `${r.value} ${r.label}`).join('; ');
      const row = [
        `"${item.name.replace(/"/g, '""')}"`, 
        `"${item.serviceTypeName.replace(/"/g, '""')}"`,
        item.quantity,
        `"${item.regionName.replace(/"/g, '""')}"`,
        `"${item.osSummary.replace('OS: ','').replace(/"/g, '""')}"`, 
        `"${item.provisioningSummary.replace('Model: ','').replace(/"/g, '""')}"`,
        `"${item.gpuSummary.replace('GPUs: ','').replace(/"/g, '""')}"`,
        `"${item.coreResourcesSummary.replace(/"/g, '""')}"`,
        `"${otherResourcesText.replace(/"/g, '""')}"`,
        `"${item.addonsSummary.replace(/"/g, '""')}"`,
        item.monthlyPricePerUnit.toFixed(2),
        `"${item.billingCycleText.replace(/"/g, '""')}"`,
        item.totalCostForPeriod.toFixed(2)
      ].join(",");
      csvContent += row + "\n";
    });
    csvContent += `\n,,,,,,,,,,"Grand Total:",,$${grandTotalForPeriod.toFixed(2)}\n`; 

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "worldposta_cloudedge_estimate.csv");
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
    showToast('Estimate CSV downloaded.');
  };


  const renderConfigurationCard = (config: CloudEdgeConfiguration) => {
    const summaryForItem = summaryItems.find(si => si.id === config.id);
    if (!summaryForItem) return null;

    const priceDisplay = `$${summaryForItem.totalCostForPeriod.toFixed(2)}${getDurationInfo(config.duration).suffix.replace('/mo', ` / ${getDurationInfo(config.duration).name.toLowerCase()}`)}`;
    
    const mainResourcesSummary = summaryForItem.coreResourcesSummary;
    const otherResourcesCount = summaryForItem.otherResourcesList.length;

    return (
        <div key={config.id} className="p-4 border border-brand-border dark:border-brand-border-dark rounded-lg bg-brand-bg-light-alt dark:bg-brand-bg-dark group">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-brand-text dark:text-brand-text-light">{config.name} (x{config.quantity})</h3>
                    <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">Type: {summaryForItem.serviceTypeName} | Duration: {summaryForItem.billingCycleText} | Region: {summaryForItem.regionName}</p>
                    <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">{summaryForItem.osSummary} | {summaryForItem.provisioningSummary}</p>
                </div>
                <span className="text-lg font-semibold text-worldposta-primary dark:text-worldposta-primary-light whitespace-nowrap">{priceDisplay}</span>
            </div>
            <div className="text-sm text-brand-text dark:text-brand-text-light space-y-1">
                <p><span className="font-medium">Main:</span> {mainResourcesSummary || "N/A"}</p>
                 {summaryForItem.gpuSummary !== 'GPUs: No GPUs' && <p><span className="font-medium">GPUs:</span> {summaryForItem.gpuSummary.replace('GPUs: ', '')}</p>}
                {otherResourcesCount > 0 && 
                    <p><span className="font-medium">Other:</span> {otherResourcesCount} additional resource(s)</p>
                }
                {summaryForItem.addonsSummary !== 'None' && 
                    <p className="text-xs"><span className="font-medium">Addons:</span> {summaryForItem.addonsSummary}</p>
                }
            </div>
            <div className="mt-3 flex space-x-2">
                <button onClick={() => openModalForEdit(config)} className="text-xs py-1 px-2.5 bg-worldposta-primary-light dark:bg-worldposta-primary/20 text-worldposta-primary dark:text-worldposta-primary-light rounded hover:opacity-80 transition-opacity" aria-label={`Edit ${config.name}`}>Edit</button>
                <button onClick={() => handleDuplicateConfiguration(config.id)} className="text-xs py-1 px-2.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 rounded hover:opacity-80 transition-opacity" aria-label={`Duplicate ${config.name}`}>Duplicate</button>
                <button onClick={() => removeConfiguration(config.id)} className="text-xs py-1 px-2.5 bg-red-100 dark:bg-danger/20 text-danger dark:text-red-300 rounded hover:opacity-80 transition-opacity" aria-label={`Remove ${config.name}`}>Remove</button>
            </div>
        </div>
    );
  };

  const renderCoreResourceControl = (resDef: VDCResourceDefinition) => {
    const currentRegionMultiplier = WORLDPOSTA_REGIONS.find(r=>r.id === currentModalRegion)?.priceMultiplier || 1;
    let pricePerUnit = resDef.pricePerUnit * currentRegionMultiplier;
    if (resDef.id === 'flashDisk') {
        const bootDiskType = BOOT_DISK_TYPE_OPTIONS.find(bdt => bdt.id === currentModalBootDiskTypeId) || BOOT_DISK_TYPE_OPTIONS[0];
        pricePerUnit *= bootDiskType.pricePerGBMultiplier;
    }

    return (
      <VDCResourceControl
        key={resDef.id}
        id={resDef.id}
        label={resDef.label}
        priceText={`$${pricePerUnit.toFixed(2)} / ${resDef.unit} / mo`}
        min={resDef.min}
        max={resDef.max}
        step={resDef.step}
        value={currentModalResourceValues[resDef.id] ?? resDef.defaultValue}
        unitLabel={!['VM License', 'OS License', 'Endpoint License', 'Instance', 'IP', 'vCPU'].includes(resDef.unit) ? resDef.unit : undefined}
        unitLabelForValue={resDef.unit}
        onChange={(value) => handleModalResourceChange(resDef.id, value)}
        disabled={currentModalServiceType === 'instance' && ['cores', 'ram', 'flashDisk'].includes(resDef.id)} 
      />
    );
  };

  const handleViewDetails = (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    const summary = summaryItems.find(si => si.id === configId);
    if (config && summary) {
        setConfigForDetailsModal(config);
        setSummaryItemForDetailsModal(summary);
        setIsDetailsModalOpen(true);
    }
  };


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toastMessage && (
        <div className="fixed top-20 right-5 bg-worldposta-primary text-brand-text-light px-4 py-2 rounded-md shadow-lg z-[150] transition-opacity duration-300 ease-in-out animate-fadeInOut" role="alert">
          {toastMessage}
        </div>
      )}
      <style>{`.animate-fadeInOut { animation: fadeInOutToast 3s ease-in-out; } @keyframes fadeInOutToast { 0% { opacity: 0; transform: translateY(-20px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-20px); } }`}</style>

      <h1 className="text-3xl sm:text-4xl font-bold text-brand-text dark:text-brand-text-light mb-4">
        Configure CloudEdge Services
      </h1>

      <div className="mb-8 p-4 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-md rounded-lg">
        <Stepper steps={CHECKOUT_STEPS} currentStepIndex={0} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6 text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">
        <div className="p-2 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-md">
            <strong>Currency:</strong> All prices are in USD. Multi-currency support is a future enhancement.
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-md">
            <strong>Free Tier:</strong> Calculations do not currently include any applicable free tier usage.
        </div>
         <div className="p-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-md">
            <strong>Discounts:</strong> Standard discounts applied based on selected commitment term. Other promotions are not shown.
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          <section className="p-6 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl">
            <div className="flex justify-between items-center mb-4 border-b border-brand-border dark:border-brand-border-dark pb-3">
                <h2 className="text-2xl font-semibold text-brand-text dark:text-brand-text-light">
                Your Configurations
                </h2>
                <button onClick={openModalForNew} className={`${buttonPrimaryStyle} text-sm`} aria-label="Add new CloudEdge configuration">+ Add Configuration</button>
            </div>
            {configurations.length === 0 ? (
                <p className="text-brand-text-secondary dark:text-brand-text-light-secondary text-center py-8">
                    No CloudEdge configurations added yet. Click "Add Configuration" to get started.
                </p>
            ) : (
                <div className="space-y-4">
                    {configurations.map(renderConfigurationCard)}
                </div>
            )}
          </section>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-24 p-6 bg-brand-bg-light dark:bg-brand-bg-dark-alt shadow-xl rounded-xl space-y-4">
            <h3 className="text-xl font-semibold text-brand-text dark:text-brand-text-light border-b border-brand-border dark:border-brand-border-dark pb-3 mb-3">
              CloudEdge Subscription Summary
            </h3>
            {summaryItems.length === 0 ? (
                <p className="text-sm text-brand-text-secondary dark:text-brand-text-light-secondary">No configurations to summarize.</p>
            ) : (
                summaryItems.map(item => (
                    <div key={item.id} className="text-sm py-2 border-b border-brand-border dark:border-brand-border-dark last:border-b-0">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-brand-text dark:text-brand-text-light">{item.name} (x{item.quantity})</span>
                            <span className="text-brand-text dark:text-brand-text-light font-semibold">${item.totalCostForPeriod.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">
                            {item.serviceTypeName} | {item.regionName} | Unit Monthly: ${item.monthlyPricePerUnit.toFixed(2)} | {item.billingCycleText}
                        </div>
                         <button 
                            onClick={() => handleViewDetails(item.id)} 
                            className="mt-1 text-xs text-worldposta-primary dark:text-worldposta-primary-light hover:underline focus:outline-none"
                         >
                            View Details
                        </button>
                    </div>
                ))
            )}
            <div className="border-t border-brand-border dark:border-brand-border-dark pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-lg font-bold text-brand-text dark:text-brand-text-light">
                <span>Grand Total:</span>
                <span>${grandTotalForPeriod.toFixed(2)}</span>
              </div>
               <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">
                Total estimated cost for all configurations for their selected durations.
              </p>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={handleClearEstimate} 
                    className={`w-full sm:w-auto text-danger dark:text-red-400 border border-danger dark:border-red-500/50 bg-transparent hover:bg-danger/10 dark:hover:bg-danger/20 font-semibold py-1.5 px-4 rounded-lg transition-colors disabled:opacity-60`} 
                    disabled={configurations.length === 0}
                    aria-label="Clear current estimate">
                    Clear Estimate
                </button>
                <button 
                    className={`w-full sm:flex-grow ${buttonPrimaryStyle}`} 
                    disabled={configurations.length === 0} 
                    aria-label="Proceed to checkout with current estimate">
                    Proceed to Checkout
                </button>
            </div>
            <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-brand-border dark:border-brand-border-dark">
                <button 
                    onClick={handleSaveEstimateToLocalStorage} 
                    className={iconButtonStyles} 
                    title="Save Estimate" 
                    aria-label="Save current estimate to browser storage"
                >
                    <ArchiveBoxArrowDownIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => handleLoadEstimateFromLocalStorage()} 
                    className={iconButtonStyles} 
                    title="Load Estimate" 
                    aria-label="Load estimate from browser storage"
                >
                    <FolderOpenIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleEmailEstimate} 
                    className={iconButtonStyles} 
                    title="Email Estimate" 
                    aria-label="Email this estimate"
                >
                    <EnvelopeIcon className="w-5 h-5" />
                </button>
                <button 
                    onClick={handleDownloadCSV} 
                    className={iconButtonStyles} 
                    title="Download CSV" 
                    aria-label="Download estimate as CSV"
                >
                    <DocumentArrowDownIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {isDetailsModalOpen && configForDetailsModal && summaryItemForDetailsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out animate-modalFadeInOverall" role="dialog" aria-modal="true" aria-labelledby="detailsModalTitle">
            <div className="bg-brand-bg-light dark:bg-brand-bg-dark-alt rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-modalFadeInContent">
                <div className="flex justify-between items-center p-4 sm:p-6 border-b border-brand-border dark:border-brand-border-dark">
                    <h2 id="detailsModalTitle" className="text-xl sm:text-2xl font-semibold text-brand-text dark:text-brand-text-light">
                        Configuration Details: {summaryItemForDetailsModal.name}
                    </h2>
                    <button onClick={() => setIsDetailsModalOpen(false)} className="text-brand-text-secondary dark:text-brand-text-light-secondary hover:text-brand-text dark:hover:text-brand-text-light text-3xl leading-none p-1 rounded-full hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark" aria-label="Close details modal">&times;</button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 text-sm text-brand-text dark:text-brand-text-light scrollbar-thin">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <p><strong>Name:</strong> {summaryItemForDetailsModal.name}</p>
                        <p><strong>Quantity:</strong> {summaryItemForDetailsModal.quantity}</p>
                        <p><strong>Service Type:</strong> {summaryItemForDetailsModal.serviceTypeName}</p>
                        <p><strong>Region:</strong> {summaryItemForDetailsModal.regionName}</p>
                        <p><strong>Commitment Term:</strong> {summaryItemForDetailsModal.billingCycleText}</p>
                        <p><strong>Unit Monthly Price:</strong> ${summaryItemForDetailsModal.monthlyPricePerUnit.toFixed(2)}</p>
                        <p className="sm:col-span-2"><strong>Total Cost for Period:</strong> <span className="font-bold text-lg">${summaryItemForDetailsModal.totalCostForPeriod.toFixed(2)}</span></p>
                    </div>

                    <h4 className="font-semibold mt-3 pt-3 border-t border-brand-border/50 dark:border-brand-border-dark/50">Core Resources:</h4>
                    {configForDetailsModal.serviceType === 'instance' && summaryItemForDetailsModal.instanceTemplateName && (
                        <p><strong>Instance Template:</strong> {summaryItemForDetailsModal.instanceTemplateName}</p>
                    )}
                    <p>{summaryItemForDetailsModal.coreResourcesSummary}</p>
                    
                    <h4 className="font-semibold mt-3 pt-3 border-t border-brand-border/50 dark:border-brand-border-dark/50">Advanced Settings:</h4>
                    <p>{summaryItemForDetailsModal.osSummary}</p>
                    <p>{summaryItemForDetailsModal.provisioningSummary}</p>
                    <p><strong>Machine Type (Boot Disk):</strong> {summaryItemForDetailsModal.bootDiskTypeName || 'N/A'}</p>
                    <p><strong>Confidential VM:</strong> {summaryItemForDetailsModal.confidentialVmEnabled ? 'Enabled' : 'Disabled'}</p>
                    <p>{summaryItemForDetailsModal.gpuSummary}</p>

                    {summaryItemForDetailsModal.otherResourcesList.length > 0 && (
                        <>
                            <h4 className="font-semibold mt-3 pt-3 border-t border-brand-border/50 dark:border-brand-border-dark/50">Other Resources:</h4>
                            <ul className="list-disc list-inside pl-2">
                                {summaryItemForDetailsModal.otherResourcesList.map(res => (
                                    <li key={res.label}>{res.label}: {res.value}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {summaryItemForDetailsModal.addonsSummary !== 'None' && (
                        <>
                            <h4 className="font-semibold mt-3 pt-3 border-t border-brand-border/50 dark:border-brand-border-dark/50">Add-ons:</h4>
                            <p>{summaryItemForDetailsModal.addonsSummary}</p>
                        </>
                    )}
                </div>
                 <div className="p-4 sm:p-6 border-t border-brand-border dark:border-brand-border-dark text-right">
                    <button onClick={() => setIsDetailsModalOpen(false)} className={`${buttonSecondaryStyle} text-sm`} aria-label="Close details modal">Close</button>
                </div>
            </div>
        </div>
      )}


       {isModalOpen && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out animate-modalFadeInOverall" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
                <div className="bg-brand-bg-light dark:bg-brand-bg-dark-alt rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalFadeInContent">
                    <div className="flex justify-between items-center p-4 sm:p-6 border-b border-brand-border dark:border-brand-border-dark">
                        <h2 id="modalTitle" className="text-xl sm:text-2xl font-semibold text-brand-text dark:text-brand-text-light">
                            {editingConfiguration ? 'Edit Configuration' : 'Add New Configuration'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-brand-text-secondary dark:text-brand-text-light-secondary hover:text-brand-text dark:hover:text-brand-text-light text-3xl leading-none p-1 rounded-full hover:bg-brand-bg-light-alt dark:hover:bg-brand-bg-dark" aria-label="Close modal">&times;</button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-brand-border dark:scrollbar-thumb-brand-text-secondary scrollbar-track-brand-bg-light-alt dark:scrollbar-track-brand-bg-dark-alt">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label htmlFor="configName" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Configuration Name:</label>
                                <input type="text" id="configName" value={currentModalConfigName} onChange={(e) => setCurrentModalConfigName(e.target.value)} className={inputStyle} placeholder="e.g., Web Server, Database Instance"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Service Type:</label>
                                <div className="flex items-center space-x-4 mt-1">
                                    {['instance', 'vdc'].map(st => (
                                      <label key={st} className="flex items-center text-sm text-brand-text dark:text-brand-text-light cursor-pointer">
                                          <input type="radio" name="serviceType" value={st} checked={currentModalServiceType === st} onChange={() => setCurrentModalServiceType(st as ServiceType)} className="h-4 w-4 text-worldposta-primary border-brand-border dark:border-brand-border-dark focus:ring-worldposta-primary focus:ring-offset-brand-bg-light-alt dark:focus:ring-offset-brand-bg-dark"/>
                                          <span className="ml-2">{st === 'instance' ? 'Instance' : 'Virtual Data Center (VDC)'}</span>
                                      </label>
                                    ))}
                                </div>
                            </div>
                             
                            <div>
                                <label htmlFor="configRegion" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Deployment Region:</label>
                                <div className="relative">
                                    <select id="configRegion" value={currentModalRegion} onChange={(e) => setCurrentModalRegion(e.target.value)} className={selectStyle}>
                                        {WORLDPOSTA_REGIONS.map(region => (<option key={region.id} value={region.id}>{region.name}</option>))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-text-secondary dark:text-brand-text-light-secondary">
                                        <ChevronDownIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                           
                            <div>
                                <label htmlFor="configDuration" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Commitment Term:</label>
                                <div className="relative">
                                    <select id="configDuration" value={currentModalDuration} onChange={(e) => setCurrentModalDuration(e.target.value as SubscriptionDuration)} className={selectStyle}>
                                        {COMMITMENT_TERM_OPTIONS.map(opt => (<option key={opt.id} value={opt.id}>{opt.name}</option>))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-text-secondary dark:text-brand-text-light-secondary">
                                        <ChevronDownIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="bootDiskType" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Machine Type (Boot Disk):</label>
                                <div className="relative">
                                    <select id="bootDiskType" value={currentModalBootDiskTypeId} onChange={e => setCurrentModalBootDiskTypeId(e.target.value)} className={selectStyle}>
                                        {BOOT_DISK_TYPE_OPTIONS.map(bdt => (<option key={bdt.id} value={bdt.id}>{bdt.name}</option>))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-text-secondary dark:text-brand-text-light-secondary">
                                        <ChevronDownIcon className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary mt-0.5">Applies to "Flash Disk Storage / Boot Disk Size" cost and performance.</p>
                            </div>
                            <div>
                                <label htmlFor="configQuantity" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Quantity:</label>
                                <input type="number" id="configQuantity" value={currentModalQuantity} min="1" onChange={(e) => setCurrentModalQuantity(Math.max(1, parseInt(e.target.value,10) || 1))} className={`${inputStyle} w-24`} aria-label="Quantity"/>
                            </div>
                        </div>

                        <div className="border-t border-brand-border dark:border-brand-border-dark pt-4">
                            <h3 className="text-md font-semibold text-brand-text dark:text-brand-text-light mb-2">Core Compute Resources</h3>
                             {currentModalServiceType === 'instance' && (
                                <div className="mb-4">
                                    <label htmlFor="instanceTemplate" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Instance Template:</label>
                                    <div className="relative">
                                        <select 
                                          id="instanceTemplate" 
                                          value={currentModalInstanceTemplateId} 
                                          onChange={(e) => setCurrentModalInstanceTemplateId(e.target.value)} 
                                          className={selectStyle}
                                          aria-label="Instance Template"
                                        >
                                            {INSTANCE_TEMPLATE_OPTIONS.map(template => (<option key={template.id} value={template.id}>{template.name}</option>))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-text-secondary dark:text-brand-text-light-secondary">
                                            <ChevronDownIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    {(() => {
                                        const selectedTemplate = INSTANCE_TEMPLATE_OPTIONS.find(t => t.id === currentModalInstanceTemplateId);
                                        if (selectedTemplate) {
                                            return (
                                                <div className="mt-1.5 p-2 bg-brand-bg-light-alt dark:bg-brand-bg-dark rounded-md text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">
                                                    Template provides: <strong className="text-brand-text dark:text-brand-text-light">{selectedTemplate.resources.cores} vCPU</strong> / <strong className="text-brand-text dark:text-brand-text-light">{selectedTemplate.resources.ram} GB RAM</strong> / <strong className="text-brand-text dark:text-brand-text-light">{selectedTemplate.resources.flashDisk} GB Boot Disk</strong>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>
                            )}
                           
                            <div className={`grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-1 ${currentModalServiceType === 'instance' ? 'hidden' : ''}`}>
                                {CLOUD_EDGE_RESOURCE_DEFINITIONS.filter(def => ['cores', 'ram', 'flashDisk'].includes(def.id)).map(renderCoreResourceControl)}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between py-3 border-t border-brand-border dark:border-brand-border-dark mt-4">
                            <h3 className="text-md font-semibold text-brand-text dark:text-brand-text-light">Advanced Settings & Optional Resources</h3>
                            <button 
                                onClick={() => setCurrentModalAdvancedSettingsEnabled(!currentModalAdvancedSettingsEnabled)}
                                className="text-sm font-medium text-worldposta-primary dark:text-worldposta-primary-light hover:underline"
                                aria-expanded={currentModalAdvancedSettingsEnabled}
                            >
                                {currentModalAdvancedSettingsEnabled ? 'Hide Advanced' : 'Show Advanced'}
                            </button>
                        </div>

                        {currentModalAdvancedSettingsEnabled && (
                            <div className="space-y-4 pt-2 pl-2 border-l-2 border-worldposta-primary/30">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <label htmlFor="osSelect" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Operating System / Software:</label>
                                        <div className="relative">
                                            <select id="osSelect" value={currentModalOperatingSystemId} onChange={e => setCurrentModalOperatingSystemId(e.target.value)} className={selectStyle}>
                                                {OPERATING_SYSTEM_OPTIONS.map(os => (<option key={os.id} value={os.id}>{os.name} {os.priceMonthly > 0 ? `(+$${os.priceMonthly}/mo)` : ''}</option>))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-text-secondary dark:text-brand-text-light-secondary">
                                                <ChevronDownIcon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Provisioning Model:</label>
                                        <div className="flex items-center space-x-4 mt-1">
                                            {PROVISIONING_MODEL_OPTIONS.map(pm => (
                                                <label key={pm.id} className="flex items-center text-sm text-brand-text dark:text-brand-text-light cursor-pointer">
                                                    <input type="radio" name="provisioningModel" value={pm.id} checked={currentModalProvisioningModel === pm.id} onChange={() => setCurrentModalProvisioningModel(pm.id)} className="h-4 w-4 text-worldposta-primary focus:ring-worldposta-primary"/>
                                                    <span className="ml-2">{pm.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2">
                                     <label className="flex items-center text-sm text-brand-text dark:text-brand-text-light cursor-pointer">
                                        <input type="checkbox" checked={currentModalConfidentialVmEnabled} onChange={e => setCurrentModalConfidentialVmEnabled(e.target.checked)} className="h-4 w-4 text-worldposta-primary rounded mr-2 focus:ring-worldposta-primary"/>
                                        Enable Confidential VM Service 
                                        <span className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary ml-1">(Note: Compatibility and pricing vary)</span>
                                    </label>
                                    <label className="flex items-center text-sm text-brand-text dark:text-brand-text-light cursor-pointer">
                                        <input type="checkbox" checked={currentModalGpusEnabled} onChange={e => setCurrentModalGpusEnabled(e.target.checked)} className="h-4 w-4 text-worldposta-primary rounded mr-2 focus:ring-worldposta-primary"/>
                                        Add GPUs
                                    </label>
                                </div>

                                {currentModalGpusEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-6 border-l-2 border-dotted border-worldposta-primary/50 ml-2">
                                        <div>
                                            <label htmlFor="gpuType" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">GPU Type:</label>
                                            <div className="relative">
                                                <select id="gpuType" value={currentModalGpuTypeId} onChange={e => setCurrentModalGpuTypeId(e.target.value)} className={selectStyle}>
                                                    {GPU_TYPE_OPTIONS.map(gpu => (<option key={gpu.id} value={gpu.id}>{gpu.name} (+$${gpu.priceMonthly}/mo)</option>))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-text-secondary dark:text-brand-text-light-secondary">
                                                    <ChevronDownIcon className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                        {currentModalGpuTypeId && (
                                            <div>
                                                <label htmlFor="gpuCount" className="block text-sm font-medium text-brand-text dark:text-brand-text-light mb-1">Number of GPUs:</label>
                                                <div className="relative w-24">
                                                    <select
                                                        id="gpuCount"
                                                        value={currentModalGpuCount || 0}
                                                        onChange={e => setCurrentModalGpuCount(parseInt(e.target.value, 10))}
                                                        className={`${selectStyle} w-full`} 
                                                        aria-label="Number of GPUs"
                                                    >
                                                        {(() => {
                                                            const selectedGpuDef = GPU_TYPE_OPTIONS.find(g => g.id === currentModalGpuTypeId);
                                                            if (!selectedGpuDef) return <option value="0">N/A</option>;

                                                            const maxGpu = selectedGpuDef.id === 'wp-gpu-shared' ? 8 : (selectedGpuDef.id === 'wp-gpu-dedicated' ? 7 : 0);
                                                            if (maxGpu === 0) return <option value="0">None</option>;

                                                            return Array.from({ length: maxGpu }, (_, i) => i + 1).map(num => (
                                                                <option key={num} value={num}>{num}</option>
                                                            ));
                                                        })()}
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-text-secondary dark:text-brand-text-light-secondary">
                                                        <ChevronDownIcon className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="pt-4 border-t border-brand-border/50 dark:border-brand-border-dark/50 mt-4">
                                     <h4 className="text-md font-semibold text-brand-text dark:text-brand-text-light mb-2">Other Configurable Resources:</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                                        {CLOUD_EDGE_RESOURCE_DEFINITIONS.filter(def => !['cores', 'ram', 'flashDisk'].includes(def.id)).map(renderCoreResourceControl)}
                                     </div>
                                </div>
                                 <div className="pt-4 border-t border-brand-border/50 dark:border-brand-border-dark/50 mt-4">
                                    <h4 className="text-md font-semibold text-brand-text dark:text-brand-text-light mb-2">Add-ons (Monthly):</h4>
                                    {currentModalAddons.map(addon => (
                                        <label key={addon.id} className="flex items-center text-sm text-brand-text dark:text-brand-text-light cursor-pointer mb-1.5">
                                            <input type="checkbox" checked={addon.selected} onChange={() => handleModalAddonToggle(addon.id)} className="h-4 w-4 text-worldposta-primary rounded mr-2 focus:ring-worldposta-primary"/>
                                            {addon.name} (+${addon.priceMonthly.toFixed(2)})
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-brand-border dark:border-brand-border-dark pt-4 mt-4">
                            <h3 className="text-md font-semibold text-brand-text dark:text-brand-text-light">Unit Subtotal (Monthly):</h3>
                            <p className="text-xl font-bold text-worldposta-primary dark:text-worldposta-primary-light">${currentModalMonthlyPricePerUnit.toFixed(2)}</p>
                            <p className="text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">For one unit, in selected region, before quantity and duration adjustments.</p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t border-brand-border dark:border-brand-border-dark">
                        <button onClick={() => setIsModalOpen(false)} className={`${buttonSecondaryStyle} text-sm`} aria-label="Cancel configuration">Cancel</button>
                        <button onClick={handleSaveConfiguration} className={`${buttonPrimaryStyle} text-sm`} aria-label={editingConfiguration ? 'Save changes to configuration' : 'Add configuration to estimate'}>
                            {editingConfiguration ? 'Save Changes' : 'Add to Estimate'}
                        </button>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes modalFadeInOverall { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes modalFadeInContent { from { opacity: 0; transform: scale(0.95) translateY(-20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                    .animate-modalFadeInOverall { animation: modalFadeInOverall 0.2s forwards ease-out; }
                    .animate-modalFadeInContent { animation: modalFadeInContent 0.3s forwards ease-out; }
                    .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #CBD5E1 #E2E8F0; } 
                    .dark .scrollbar-thin { scrollbar-color: #4A5568 #2D3748; }
                    
                    .scrollbar-thin::-webkit-scrollbar { width: 8px; height: 8px; }
                    .scrollbar-thin::-webkit-scrollbar-track { background: #E2E8F0; border-radius:4px; }
                    .dark .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; }
                    .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #CBD5E1; border-radius: 4px; border: 2px solid #E2E8F0; }
                    .dark .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border: 2px solid #2D3748; }
                    .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #A0AEC0; }
                    .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #718096; }
                ` }} />
            </div>
        )}
    </div>
  );
};
