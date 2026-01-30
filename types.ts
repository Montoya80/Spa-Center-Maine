
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  APPOINTMENTS = 'APPOINTMENTS',
  PATIENTS = 'PATIENTS',
  PATIENT_DETAIL = 'PATIENT_DETAIL',
  SETTINGS = 'SETTINGS', 
  EMPLOYEES = 'EMPLOYEES',
  INVENTORY = 'INVENTORY',
  CLIENT_BOOKING = 'CLIENT_BOOKING',
  CLIENT_PORTAL = 'CLIENT_PORTAL'
}

export type UserRole = 'admin' | 'client';

export type Permission = 
  | 'all' // Super Admin
  | 'view_appointments' 
  | 'edit_appointments' 
  | 'view_patients' 
  | 'edit_patients' 
  | 'view_finance' 
  | 'manage_settings'
  | 'manage_employees'
  | 'manage_inventory';

export interface FileDocument {
    id: string;
    name: string;
    type: 'image' | 'pdf';
    url: string; 
    category: 'ine_front' | 'ine_back' | 'license' | 'degree' | 'other';
    uploadDate: string;
}

export interface WorkSchedule {
    dayOfWeek: number; 
    active: boolean;
    startTime: string;
    endTime: string;
}

export interface AttendanceRecord {
    date: string; 
    checkIn?: string; 
    checkOut?: string; 
    status: 'present' | 'absent' | 'late';
}

export interface BankingInfo {
    bankName: string;
    accountNumber: string;
    clabe: string;
    cardNumber: string;
    accountHolder: string;
}

export type EmployeeStatus = 'active' | 'suspended' | 'terminated';

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  phone: string; 
  birthDate: string; 
  hireDate: string; 
  jobTitle: string; 
  password?: string;
  role: string; 
  permissions: Permission[];
  avatarUrl: string;
  workSchedule: WorkSchedule[]; 
  attendanceLog: AttendanceRecord[]; 
  bankingInfo?: BankingInfo;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  documents?: FileDocument[];
  status: EmployeeStatus; 
  statusChangeDate?: string; 
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; 
  active: boolean;
  description?: string; 
  imageUrl?: string; 
}

export type ProductCategoryType = 'retail' | 'professional';

export interface Product {
  id: string;
  name: string;
  price: number; 
  stock: number;
  active: boolean;
  description?: string;
  imageUrl?: string;
  category?: string;
  categoryType: ProductCategoryType; 
}

export interface InventoryTransaction {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    type: 'consumption' | 'restock' | 'adjustment';
    date: string;
    employeeId: string;
    employeeName: string;
    patientId?: string;
    patientName?: string;
    notes?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountText: string; 
  validUntil?: string; 
  active: boolean;
  color: string; 
  price?: number; 
}

export interface DaySchedule {
  dayOfWeek: number; 
  label: string;
  isOpen: boolean;
  openTime: string; 
  closeTime: string; 
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string; 
  senderEmail: string;
  senderName: string;
  enabled: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  enabled: boolean;
}

export interface BusinessConfig {
  schedule: DaySchedule[];
  blockedDates: string[]; 
  blockedSlots: string[]; 
  contact: {
    address: string;
    phone: string;
    whatsapp: string;
    email: string;
    mapUrl: string;
    facebookUrl?: string; 
    instagramUrl?: string; 
    tiktokUrl?: string; 
  };
  emailConfig: EmailConfig;
  supabaseConfig?: SupabaseConfig;
  bankingInfo?: BankingInfo; 
}

export interface ClinicalNoteMaterial {
    productId: string;
    name: string;
    quantity: number;
}

export interface ClinicalNote {
  id: string;
  date: string;
  treatment: string;
  observations: string;
  productsUsed?: string[]; 
  materialsUsed?: ClinicalNoteMaterial[]; 
  therapistId?: string;
  therapistName?: string;
}

export interface ProgressPhoto {
    id: string;
    date: string;
    type: 'before' | 'after';
    url: string; 
    notes?: string;
}

export interface Patient {
  id: string;
  clientCode: string; 
  fileNumber: string; 
  fullName: string;
  password?: string; 
  birthDate: string; 
  email: string;
  phone: string;
  skinType: string;
  allergies: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
  history: ClinicalNote[];
  progressPhotos?: ProgressPhoto[];
  documents?: FileDocument[];
  clinicRecommendations?: string; 
  avatarUrl: string;
  registeredBy?: string; 
  registrationDate?: string; 
  assignedTherapist?: string; 
  isBlocked?: boolean; 
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string; 
  time: string;
  service: string; 
  price?: number;
  discount?: number; 
  discountAppliedBy?: string; 
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  assignedTo?: string; 
  paymentVerified?: boolean; 
}

export interface TreatmentSuggestion {
  plan: string;
  products: string[];
  lifestyleAdvice: string;
}
