
export interface User {
  id: string;
  email: string;
  displayName: string;
  companyName?: string;
  avatarUrl?: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  url: string;
  tags?: string[];
}

export interface NavigationItem {
  name: string;
  path: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  exact?: boolean;
}

export interface MfaMethod {
  id: string;
  type: 'Authenticator App' | 'SMS' | 'Security Key';
  details: string; // e.g., "Google Authenticator" or last 4 digits of phone
  addedDate: string;
}

export interface LoginActivity {
  id: string;
  date: string;
  ipAddress: string;
  location: string;
  device: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  service: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'Open' | 'Pending' | 'Resolved' | 'Closed';
  lastUpdate: string;
  product: string;
}

export enum AppRoutes {
  Login = "/login",
  Mfa = "/mfa",
  ForgotPassword = "/forgot-password",
  SignUp = "/signup",
  Dashboard = "/dashboard",
  Profile = "/profile",
  Security = "/security",
  // Billing = "/billing", // Removed
  // Support = "/support", // Removed
  OrgManagement = "/organization",
  UserManagement = "/users",
  PermissionGroups = "/permission-groups",
  ActionLogs = "/action-logs", 
  ResellerProgram = "/reseller-program", // Added ResellerProgram route
}