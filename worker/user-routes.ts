import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, PatientEntity, ServiceEntity, AppointmentEntity, InvoiceEntity, InventoryItemEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, Patient, Service, Appointment, Invoice, InventoryItem } from "@shared/types";
// Secure password hashing and verification using Web Crypto API
const textEncoder = new TextEncoder();
const hashPassword = async (password: string): Promise<string> => {
  const encoded = textEncoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};
const checkPassword = async (plain: string, hash: string | undefined) => {
  if (!hash) return false;
  const plainHash = await hashPassword(plain);
  console.log("Plain password for check:", plain);
  console.log("Stored hash:", hash);
  console.log("Generated hash for check:", plainHash);
  return plainHash === hash;
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is present on first load
  app.use('*', async (c, next) => {
    console.log('Seeding process initiated...');
    try {
      await Promise.all([
        UserEntity.ensureSeed(c.env),
        PatientEntity.ensureSeed(c.env),
        ServiceEntity.ensureSeed(c.env),
        AppointmentEntity.ensureSeed(c.env),
        InvoiceEntity.ensureSeed(c.env),
        InventoryItemEntity.ensureSeed(c.env),
      ]);
      console.log('Seeding process completed.');
    } catch (error) {
      console.error('Error during seeding process:', error);
    }
    await next();
  });
  // AUTH
  app.post('/api/auth/login', async (c) => {
    const { identifier, password } = await c.req.json<{ identifier?: string; password?: string }>();
    if (!isStr(identifier) || !isStr(password)) return bad(c, 'Username/email and password are required.');
    const allUsers = (await UserEntity.list(c.env)).items;
    const user = allUsers.find(u => u.username === identifier || u.email === identifier);
    if (!user || !(await checkPassword(password, user.password_hash))) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    const { password_hash, ...userClientData } = user;
    return ok(c, { ...userClientData, permissions: user.permissions || [] });
  });


  // USERS (STAFF)
  app.get('/api/users', async (c) => ok(c, await UserEntity.list(c.env)));
  app.post('/api/users', async (c) => {
    const data = await c.req.json<Partial<User>>();
    if (!data.username || !data.email || !data.full_name || !data.role || !data.password) return bad(c, 'Missing required fields');
    const newUser: User = {
      id: crypto.randomUUID(),
      username: data.username,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      phone: data.phone,
      password_hash: await hashPassword(data.password),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      permissions: data.permissions || [],
    };
    return ok(c, await UserEntity.create(c.env, newUser));
  });
  app.patch('/api/users/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json<Partial<User>>();
    const userEntity = new UserEntity(c.env, id);
    if (!await userEntity.exists()) return notFound(c, 'User not found');
    await userEntity.mutate(current => ({ ...current, ...data, updated_at: new Date().toISOString() }));
    return ok(c, await userEntity.getState());
  });
  app.delete('/api/users/:id', async (c) => ok(c, { deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  // PATIENTS
  app.get('/api/patients', async (c) => ok(c, await PatientEntity.list(c.env)));
  app.get('/api/patients/:id', async (c) => {
    const id = c.req.param('id');
    const patientEntity = new PatientEntity(c.env, id);
    if (!await patientEntity.exists()) return notFound(c, 'Patient not found');
    return ok(c, await patientEntity.getState());
  });
  app.post('/api/patients', async (c) => {
    const data = await c.req.json<Partial<Patient>>();
    if (!data.full_name || !data.phone) return bad(c, 'Full name and phone are required');
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      full_name: data.full_name,
      phone: data.phone,
      email: data.email,
      dob: data.dob,
      medical_history: data.medical_history,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return ok(c, await PatientEntity.create(c.env, newPatient));
  });
  app.patch('/api/patients/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json<Partial<Patient>>();
    const patientEntity = new PatientEntity(c.env, id);
    if (!await patientEntity.exists()) return notFound(c, 'Patient not found');
    await patientEntity.mutate(current => ({ ...current, ...data, updated_at: new Date().toISOString() }));
    return ok(c, await patientEntity.getState());
  });
  app.delete('/api/patients/:id', async (c) => ok(c, { deleted: await PatientEntity.delete(c.env, c.req.param('id')) }));
  // SERVICES
  app.get('/api/services', async (c) => ok(c, await ServiceEntity.list(c.env)));
  app.post('/api/services', async (c) => {
    const data = await c.req.json<Partial<Service>>();
    if (!data.name || data.default_price == null || data.estimated_duration_minutes == null) return bad(c, 'Name, price, and duration are required');
    const newService: Service = {
      id: crypto.randomUUID(),
      name: data.name,
      category: data.category || 'General',
      default_price: data.default_price,
      estimated_duration_minutes: data.estimated_duration_minutes,
      description: data.description,
      active_flag: true,
    };
    return ok(c, await ServiceEntity.create(c.env, newService));
  });
  app.patch('/api/services/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json<Partial<Service>>();
    const serviceEntity = new ServiceEntity(c.env, id);
    if (!await serviceEntity.exists()) return notFound(c, 'Service not found');
    await serviceEntity.mutate(current => ({ ...current, ...data }));
    return ok(c, await serviceEntity.getState());
  });
  app.delete('/api/services/:id', async (c) => ok(c, { deleted: await ServiceEntity.delete(c.env, c.req.param('id')) }));
  // APPOINTMENTS
  app.get('/api/appointments', async (c) => ok(c, await AppointmentEntity.list(c.env)));
  app.post('/api/appointments', async (c) => {
    const data = await c.req.json<Partial<Appointment>>();
    if (!data.patient_id || !data.doctor_user_id || !data.service_id || !data.start_time) return bad(c, 'Missing required fields for appointment');
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      ...data,
      status: data.status || 'Scheduled',
    } as Appointment;
    return ok(c, await AppointmentEntity.create(c.env, newAppointment));
  });
  app.patch('/api/appointments/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json<Partial<Appointment>>();
    const appointmentEntity = new AppointmentEntity(c.env, id);
    if (!await appointmentEntity.exists()) return notFound(c, 'Appointment not found');
    await appointmentEntity.mutate(current => ({ ...current, ...data }));
    return ok(c, await appointmentEntity.getState());
  });
  app.delete('/api/appointments/:id', async (c) => ok(c, { deleted: await AppointmentEntity.delete(c.env, c.req.param('id')) }));
  // INVOICES
  app.get('/api/invoices', async (c) => ok(c, await InvoiceEntity.list(c.env)));
  app.post('/api/invoices', async (c) => {
    const data = await c.req.json<Partial<Invoice>>();
    if (!data.patient_id || data.total_amount == null) return bad(c, 'Missing required fields for invoice');
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      invoice_number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      ...data,
      created_by_user_id: data.created_by_user_id || 'system',
      status: data.status || 'Unpaid',
      created_at: new Date().toISOString(),
    } as Invoice;
    return ok(c, await InvoiceEntity.create(c.env, newInvoice));
  });
  app.patch('/api/invoices/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json<Partial<Invoice>>();
    const invoiceEntity = new InvoiceEntity(c.env, id);
    if (!await invoiceEntity.exists()) return notFound(c, 'Invoice not found');
    await invoiceEntity.mutate(current => ({ ...current, ...data }));
    return ok(c, await invoiceEntity.getState());
  });
  app.delete('/api/invoices/:id', async (c) => ok(c, { deleted: await InvoiceEntity.delete(c.env, c.req.param('id')) }));
  // INVENTORY
  app.get('/api/inventory', async (c) => ok(c, await InventoryItemEntity.list(c.env)));
  app.post('/api/inventory', async (c) => {
    const data = await c.req.json<Partial<InventoryItem>>();
    if (!data.name || !data.unit || data.quantity_on_hand == null || data.reorder_threshold == null) return bad(c, 'Missing required fields for inventory item');
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      ...data,
    } as InventoryItem;
    return ok(c, await InventoryItemEntity.create(c.env, newItem));
  });
  app.patch('/api/inventory/:id', async (c) => {
    const id = c.req.param('id');
    const data = await c.req.json<Partial<InventoryItem>>();
    const itemEntity = new InventoryItemEntity(c.env, id);
    if (!await itemEntity.exists()) return notFound(c, 'Inventory item not found');
    await itemEntity.mutate(current => ({ ...current, ...data }));
    return ok(c, await itemEntity.getState());
  });
  app.delete('/api/inventory/:id', async (c) => ok(c, { deleted: await InventoryItemEntity.delete(c.env, c.req.param('id')) }));
}