export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export enum Role {
  Admin = 'Admin',
  Manager = 'Manager',
  Doctor = 'Doctor',
  Receptionist = 'Receptionist',
  Accountant = 'Accountant',
  InventoryManager = 'InventoryManager',
  Patient = 'Patient',
}
export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Only for creation/update, never sent to client
  password_hash?: string; // Stored in DB
  full_name: string;
  role: Role;
  phone?: string;
  permissions?: string[]; // Array of module keys
  created_at: string;
  updated_at: string;
}
export interface Patient {
  id: string;
  user_id?: string;
  full_name: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  emergency_contact?: string;
  medical_history?: string;
  created_at: string;
  updated_at: string;
}
export interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  default_price: number;
  estimated_duration_minutes: number;
  active_flag: boolean;
}
export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  CheckedIn = 'Checked-in',
  Completed = 'Completed',
  NoShow = 'No-show',
  Cancelled = 'Cancelled',
}
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_user_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
}
export enum InvoiceStatus {
  Paid = 'Paid',
  Unpaid = 'Unpaid',
  PartiallyPaid = 'Partially Paid',
}
export interface Invoice {
  id: string;
  invoice_number: string;
  patient_id: string;
  created_by_user_id: string;
  total_amount: number;
  tax: number;
  discount: number;
  status: InvoiceStatus;
  created_at: string;
}
export interface InventoryItem {
    id: string;
    name: string;
    sku?: string;
    unit: string; // e.g., 'box', 'piece', 'ml'
    quantity_on_hand: number;
    reorder_threshold: number;
    unit_price?: number;
    last_received_at?: string;
}
export interface InventoryTransaction {
    id: string;
    item_id: string;
    type: 'receive' | 'consume' | 'adjust';
    quantity: number;
    related_entity?: string; // e.g., appointment_id or invoice_id
    notes?: string;
    created_by: string; // user_id
    created_at: string;
}