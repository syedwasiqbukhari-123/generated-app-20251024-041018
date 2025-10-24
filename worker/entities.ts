import { IndexedEntity } from "./core-utils";
import { User, Patient, Service, Role, Appointment, Invoice, AppointmentStatus, InvoiceStatus, InventoryItem } from "@shared/types";
import { MOCK_USERS, MOCK_PATIENTS, MOCK_SERVICES, MOCK_APPOINTMENTS, MOCK_INVOICES, MOCK_INVENTORY_ITEMS } from "@shared/mock-data";
// USER ENTITY (Staff)
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    username: "",
    email: "",
    password_hash: "",
    full_name: "",
    role: Role.Receptionist,
    permissions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  static seedData = MOCK_USERS;
}
// PATIENT ENTITY
export class PatientEntity extends IndexedEntity<Patient> {
  static readonly entityName = "patient";
  static readonly indexName = "patients";
  static readonly initialState: Patient = {
    id: "",
    full_name: "",
    phone: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  static seedData = MOCK_PATIENTS;
}
// SERVICE ENTITY
export class ServiceEntity extends IndexedEntity<Service> {
  static readonly entityName = "service";
  static readonly indexName = "services";
  static readonly initialState: Service = {
    id: "",
    name: "",
    category: "",
    default_price: 0,
    estimated_duration_minutes: 30,
    active_flag: true,
  };
  static seedData = MOCK_SERVICES;
}
// APPOINTMENT ENTITY
export class AppointmentEntity extends IndexedEntity<Appointment> {
  static readonly entityName = "appointment";
  static readonly indexName = "appointments";
  static readonly initialState: Appointment = {
    id: "",
    patient_id: "",
    doctor_user_id: "",
    service_id: "",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    status: AppointmentStatus.Scheduled,
  };
  static seedData = MOCK_APPOINTMENTS;
}
// INVOICE ENTITY
export class InvoiceEntity extends IndexedEntity<Invoice> {
  static readonly entityName = "invoice";
  static readonly indexName = "invoices";
  static readonly initialState: Invoice = {
    id: "",
    invoice_number: "",
    patient_id: "",
    created_by_user_id: "",
    total_amount: 0,
    tax: 0,
    discount: 0,
    status: InvoiceStatus.Unpaid,
    created_at: new Date().toISOString(),
  };
  static seedData = MOCK_INVOICES;
}
// INVENTORY ITEM ENTITY
export class InventoryItemEntity extends IndexedEntity<InventoryItem> {
  static readonly entityName = "inventoryItem";
  static readonly indexName = "inventoryItems";
  static readonly initialState: InventoryItem = {
    id: "",
    name: "",
    unit: "piece",
    quantity_on_hand: 0,
    reorder_threshold: 0,
  };
  static seedData = MOCK_INVENTORY_ITEMS;
}