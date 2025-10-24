import { User, Patient, Service, Role, Appointment, AppointmentStatus, Invoice, InvoiceStatus, InventoryItem } from './types';
const allModules = ['dashboard', 'appointments', 'patients', 'staff', 'services', 'invoices', 'inventory', 'reports', 'settings'];
export const MOCK_USERS: User[] = [
  {
    id: 'user-admin-01',
    username: 'admin',
    email: 'admin@example.com',
    password_hash: '89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8',
    full_name: 'Dr. Admin',
    role: Role.Admin,
    phone: '03001234567',
    permissions: allModules,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-admin-02',
    username: 'superadmin',
    email: 'superadmin@example.com',
    password_hash: '89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8',
    full_name: 'Super Admin',
    role: Role.Admin,
    phone: '03000000000',
    permissions: allModules,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-doctor-01',
    username: 'dr_aisha',
    email: 'aisha@clinic.test',
    password_hash: '89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8',
    full_name: 'Dr. Aisha Khan',
    role: Role.Doctor,
    phone: '03017654321',
    permissions: ['dashboard', 'appointments', 'patients'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'user-reception-01',
    username: 'reception_ali',
    email: 'ali@clinic.test',
    password_hash: '89e01536ac207279409d4de1e5253e01f4a1769e696db0d6062ca9b8f56767c8',
    full_name: 'Ali Ahmed',
    role: Role.Receptionist,
    phone: '03021122334',
    permissions: ['dashboard', 'appointments', 'patients', 'invoices'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'patient-01',
    full_name: 'Zainab Bibi',
    dob: '1992-05-12',
    gender: 'Female',
    phone: '03334567890',
    email: 'zainab@testmail.com',
    medical_history: 'Allergic to penicillin.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'patient-02',
    full_name: 'Bilal Hassan',
    dob: '1985-11-20',
    gender: 'Male',
    phone: '03450987654',
    email: 'bilal@testmail.com',
    medical_history: 'None.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
export const MOCK_SERVICES: Service[] = [
  {
    id: 'service-01',
    name: 'Teeth Cleaning & Polishing',
    description: 'Routine cleaning to remove plaque and tartar.',
    category: 'General Dentistry',
    default_price: 5000,
    estimated_duration_minutes: 45,
    active_flag: true,
  },
  {
    id: 'service-02',
    name: 'Tooth Filling (Composite)',
    description: 'Repairing a cavity with tooth-colored composite material.',
    category: 'Restorative',
    default_price: 8000,
    estimated_duration_minutes: 60,
    active_flag: true,
  },
  {
    id: 'service-03',
    name: 'Root Canal Treatment',
    description: 'Treatment for infected tooth pulp.',
    category: 'Endodontics',
    default_price: 25000,
    estimated_duration_minutes: 90,
    active_flag: true,
  },
];
const today = new Date();
const setTime = (date: Date, hours: number, minutes: number) => {
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};
export const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: 'appt-01',
        patient_id: 'patient-01',
        doctor_user_id: 'user-doctor-01',
        service_id: 'service-01',
        start_time: setTime(today, 9, 0).toISOString(),
        end_time: setTime(today, 9, 45).toISOString(),
        status: AppointmentStatus.Scheduled,
        notes: 'Routine checkup.'
    },
    {
        id: 'appt-02',
        patient_id: 'patient-02',
        doctor_user_id: 'user-doctor-01',
        service_id: 'service-02',
        start_time: setTime(today, 11, 0).toISOString(),
        end_time: setTime(today, 12, 0).toISOString(),
        status: AppointmentStatus.Scheduled,
    }
];
export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'inv-01',
        invoice_number: 'INV-2024-001',
        patient_id: 'patient-01',
        created_by_user_id: 'user-reception-01',
        total_amount: 5000,
        tax: 0,
        discount: 0,
        status: InvoiceStatus.Paid,
        created_at: new Date().toISOString(),
    },
    {
        id: 'inv-02',
        invoice_number: 'INV-2024-002',
        patient_id: 'patient-02',
        created_by_user_id: 'user-reception-01',
        total_amount: 8000,
        tax: 0,
        discount: 500,
        status: InvoiceStatus.Unpaid,
        created_at: new Date().toISOString(),
    }
];
export const MOCK_INVENTORY_ITEMS: InventoryItem[] = [
    {
        id: 'item-01',
        name: 'Dental Gloves',
        sku: 'GLV-M-100',
        unit: 'box',
        quantity_on_hand: 50,
        reorder_threshold: 10,
    },
    {
        id: 'item-02',
        name: 'Surgical Masks',
        sku: 'MSK-S-50',
        unit: 'box',
        quantity_on_hand: 80,
        reorder_threshold: 20,
    },
    {
        id: 'item-03',
        name: 'Composite Resin (A2)',
        sku: 'CMP-A2-4G',
        unit: 'syringe',
        quantity_on_hand: 8,
        reorder_threshold: 5,
    }
];