import "server-only";
import postgres from "postgres";
import type {
  Bicycle,
  Customer,
  PaymentStatus,
  ServiceRecord,
  ServiceStatus,
  User,
  UserRole,
} from "./types";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set. Configure it with the Supabase Transaction Pooler connection string.",
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __velo_sql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  global.__velo_sql ??
  postgres(connectionString, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__velo_sql = sql;
}

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
};

type UserWithHashRow = UserRow & { password_hash: string };

type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

type BicycleRow = {
  id: string;
  customer_id: string;
  brand: string;
  model: string;
  year: number | null;
  type: string | null;
  color: string | null;
  serial_number: string | null;
  frame_size: string | null;
  wheel_size: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

type ServiceRow = {
  id: string;
  bicycle_id: string;
  customer_id: string;
  received_date: Date;
  completed_date: Date | null;
  work_description: string;
  parts_list: string | null;
  parts_cost: string;
  labor_cost: string;
  discount: string;
  paid_amount: string;
  payment_status: PaymentStatus;
  status: ServiceStatus;
  technician: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

const iso = (d: Date) => d.toISOString();
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city,
    notes: row.notes,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapBicycle(row: BicycleRow): Bicycle {
  return {
    id: row.id,
    customerId: row.customer_id,
    brand: row.brand,
    model: row.model,
    year: row.year,
    type: row.type as Bicycle["type"],
    color: row.color,
    serialNumber: row.serial_number,
    frameSize: row.frame_size,
    wheelSize: row.wheel_size,
    notes: row.notes,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapService(row: ServiceRow): ServiceRecord {
  return {
    id: row.id,
    bicycleId: row.bicycle_id,
    customerId: row.customer_id,
    receivedDate: isoDate(row.received_date),
    completedDate: row.completed_date ? isoDate(row.completed_date) : null,
    workDescription: row.work_description,
    partsList: row.parts_list,
    partsCost: Number(row.parts_cost),
    laborCost: Number(row.labor_cost),
    discount: Number(row.discount),
    paidAmount: Number(row.paid_amount),
    paymentStatus: row.payment_status,
    status: row.status,
    technician: row.technician,
    notes: row.notes,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

// ---------- Users ----------

export async function findUserByEmail(
  email: string,
): Promise<(User & { passwordHash: string }) | null> {
  const rows = await sql<UserWithHashRow[]>`
    select id, email, name, role, password_hash, created_at, updated_at
    from velo_users
    where lower(email) = lower(${email})
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return { ...mapUser(row), passwordHash: row.password_hash };
}

export async function findUserById(id: string): Promise<User | null> {
  const rows = await sql<UserRow[]>`
    select id, email, name, role, created_at, updated_at
    from velo_users
    where id = ${id}
    limit 1
  `;
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function listUsers(): Promise<User[]> {
  const rows = await sql<UserRow[]>`
    select id, email, name, role, created_at, updated_at
    from velo_users
    order by name
  `;
  return rows.map(mapUser);
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
}): Promise<User> {
  const rows = await sql<UserRow[]>`
    insert into velo_users (email, password_hash, name, role)
    values (${input.email}, ${input.passwordHash}, ${input.name}, ${input.role})
    returning id, email, name, role, created_at, updated_at
  `;
  return mapUser(rows[0]);
}

export async function updateUserPassword(
  id: string,
  passwordHash: string,
): Promise<void> {
  await sql`update velo_users set password_hash = ${passwordHash} where id = ${id}`;
}

export async function deleteUser(id: string): Promise<void> {
  await sql`delete from velo_users where id = ${id}`;
}

// ---------- Customers ----------

export async function listCustomers(): Promise<Customer[]> {
  const rows = await sql<CustomerRow[]>`
    select * from velo_customers order by last_name, first_name
  `;
  return rows.map(mapCustomer);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const rows = await sql<CustomerRow[]>`
    select * from velo_customers where id = ${id} limit 1
  `;
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function createCustomerRow(input: {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
}): Promise<Customer> {
  const rows = await sql<CustomerRow[]>`
    insert into velo_customers (first_name, last_name, phone, email, address, city, notes)
    values (
      ${input.firstName},
      ${input.lastName},
      ${input.phone ?? null},
      ${input.email ?? null},
      ${input.address ?? null},
      ${input.city ?? null},
      ${input.notes ?? null}
    )
    returning *
  `;
  return mapCustomer(rows[0]);
}

export async function updateCustomerRow(
  id: string,
  input: {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    notes?: string;
  },
): Promise<Customer | null> {
  const rows = await sql<CustomerRow[]>`
    update velo_customers set
      first_name = ${input.firstName},
      last_name = ${input.lastName},
      phone = ${input.phone ?? null},
      email = ${input.email ?? null},
      address = ${input.address ?? null},
      city = ${input.city ?? null},
      notes = ${input.notes ?? null}
    where id = ${id}
    returning *
  `;
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function deleteCustomerRow(id: string): Promise<void> {
  await sql`delete from velo_customers where id = ${id}`;
}

// ---------- Bicycles ----------

export async function listBicycles(): Promise<Bicycle[]> {
  const rows = await sql<BicycleRow[]>`
    select * from velo_bicycles order by brand, model
  `;
  return rows.map(mapBicycle);
}

export async function listBicyclesByCustomer(
  customerId: string,
): Promise<Bicycle[]> {
  const rows = await sql<BicycleRow[]>`
    select * from velo_bicycles where customer_id = ${customerId} order by brand, model
  `;
  return rows.map(mapBicycle);
}

export async function getBicycle(id: string): Promise<Bicycle | null> {
  const rows = await sql<BicycleRow[]>`
    select * from velo_bicycles where id = ${id} limit 1
  `;
  return rows[0] ? mapBicycle(rows[0]) : null;
}

export async function createBicycleRow(input: {
  customerId: string;
  brand: string;
  model: string;
  year?: number;
  type?: string;
  color?: string;
  serialNumber?: string;
  frameSize?: string;
  wheelSize?: string;
  notes?: string;
}): Promise<Bicycle> {
  const rows = await sql<BicycleRow[]>`
    insert into velo_bicycles (
      customer_id, brand, model, year, type, color,
      serial_number, frame_size, wheel_size, notes
    ) values (
      ${input.customerId},
      ${input.brand},
      ${input.model},
      ${input.year ?? null},
      ${input.type ?? null},
      ${input.color ?? null},
      ${input.serialNumber ?? null},
      ${input.frameSize ?? null},
      ${input.wheelSize ?? null},
      ${input.notes ?? null}
    )
    returning *
  `;
  return mapBicycle(rows[0]);
}

export async function updateBicycleRow(
  id: string,
  input: {
    customerId: string;
    brand: string;
    model: string;
    year?: number;
    type?: string;
    color?: string;
    serialNumber?: string;
    frameSize?: string;
    wheelSize?: string;
    notes?: string;
  },
): Promise<Bicycle | null> {
  const rows = await sql<BicycleRow[]>`
    update velo_bicycles set
      customer_id = ${input.customerId},
      brand = ${input.brand},
      model = ${input.model},
      year = ${input.year ?? null},
      type = ${input.type ?? null},
      color = ${input.color ?? null},
      serial_number = ${input.serialNumber ?? null},
      frame_size = ${input.frameSize ?? null},
      wheel_size = ${input.wheelSize ?? null},
      notes = ${input.notes ?? null}
    where id = ${id}
    returning *
  `;
  return rows[0] ? mapBicycle(rows[0]) : null;
}

export async function deleteBicycleRow(id: string): Promise<void> {
  await sql`delete from velo_bicycles where id = ${id}`;
}

// ---------- Service Records ----------

export async function listServiceRecords(): Promise<ServiceRecord[]> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records order by received_date desc, created_at desc
  `;
  return rows.map(mapService);
}

export async function listServiceRecordsByStatus(
  status: ServiceStatus,
): Promise<ServiceRecord[]> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records
    where status = ${status}
    order by received_date desc, created_at desc
  `;
  return rows.map(mapService);
}

export async function listServiceRecordsByCustomer(
  customerId: string,
): Promise<ServiceRecord[]> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records
    where customer_id = ${customerId}
    order by received_date desc, created_at desc
  `;
  return rows.map(mapService);
}

export async function listServiceRecordsByBicycle(
  bicycleId: string,
): Promise<ServiceRecord[]> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records
    where bicycle_id = ${bicycleId}
    order by received_date desc, created_at desc
  `;
  return rows.map(mapService);
}

export async function getServiceRecord(
  id: string,
): Promise<ServiceRecord | null> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records where id = ${id} limit 1
  `;
  return rows[0] ? mapService(rows[0]) : null;
}

export async function createServiceRecordRow(input: {
  bicycleId: string;
  customerId: string;
  receivedDate: string;
  completedDate?: string;
  workDescription: string;
  partsList?: string;
  partsCost: number;
  laborCost: number;
  discount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  status: ServiceStatus;
  technician?: string;
  notes?: string;
}): Promise<ServiceRecord> {
  const rows = await sql<ServiceRow[]>`
    insert into velo_service_records (
      bicycle_id, customer_id, received_date, completed_date,
      work_description, parts_list, parts_cost, labor_cost,
      discount, paid_amount, payment_status, status, technician, notes
    ) values (
      ${input.bicycleId},
      ${input.customerId},
      ${input.receivedDate},
      ${input.completedDate ?? null},
      ${input.workDescription},
      ${input.partsList ?? null},
      ${input.partsCost},
      ${input.laborCost},
      ${input.discount},
      ${input.paidAmount},
      ${input.paymentStatus},
      ${input.status},
      ${input.technician ?? null},
      ${input.notes ?? null}
    )
    returning *
  `;
  return mapService(rows[0]);
}

export async function updateServiceRecordRow(
  id: string,
  input: {
    bicycleId: string;
    customerId: string;
    receivedDate: string;
    completedDate?: string;
    workDescription: string;
    partsList?: string;
    partsCost: number;
    laborCost: number;
    discount: number;
    paidAmount: number;
    paymentStatus: PaymentStatus;
    status: ServiceStatus;
    technician?: string;
    notes?: string;
  },
): Promise<ServiceRecord | null> {
  const rows = await sql<ServiceRow[]>`
    update velo_service_records set
      bicycle_id = ${input.bicycleId},
      customer_id = ${input.customerId},
      received_date = ${input.receivedDate},
      completed_date = ${input.completedDate ?? null},
      work_description = ${input.workDescription},
      parts_list = ${input.partsList ?? null},
      parts_cost = ${input.partsCost},
      labor_cost = ${input.laborCost},
      discount = ${input.discount},
      paid_amount = ${input.paidAmount},
      payment_status = ${input.paymentStatus},
      status = ${input.status},
      technician = ${input.technician ?? null},
      notes = ${input.notes ?? null}
    where id = ${id}
    returning *
  `;
  return rows[0] ? mapService(rows[0]) : null;
}

export async function deleteServiceRecordRow(id: string): Promise<void> {
  await sql`delete from velo_service_records where id = ${id}`;
}

// ---------- Dashboard helpers ----------

export async function countCustomers(): Promise<number> {
  const rows = await sql<{ count: string }[]>`select count(*) from velo_customers`;
  return Number(rows[0].count);
}

export async function countBicycles(): Promise<number> {
  const rows = await sql<{ count: string }[]>`select count(*) from velo_bicycles`;
  return Number(rows[0].count);
}

export async function getDashboardStats(): Promise<{
  totalCustomers: number;
  totalBicycles: number;
  totalServices: number;
  openServices: number;
  monthRevenue: number;
  outstanding: number;
}> {
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .slice(0, 10);

  const [counts] = await sql<
    {
      total_customers: string;
      total_bicycles: string;
      total_services: string;
      open_services: string;
    }[]
  >`
    select
      (select count(*) from velo_customers) as total_customers,
      (select count(*) from velo_bicycles) as total_bicycles,
      (select count(*) from velo_service_records) as total_services,
      (select count(*) from velo_service_records
        where status not in ('delivered', 'cancelled')) as open_services
  `;

  const [revenue] = await sql<{ month_revenue: string }[]>`
    select coalesce(sum(greatest(0, parts_cost + labor_cost - discount)), 0) as month_revenue
    from velo_service_records
    where received_date >= ${monthStart}
  `;

  const [out] = await sql<{ outstanding: string }[]>`
    select coalesce(sum(
      greatest(0,
        greatest(0, parts_cost + labor_cost - discount) - paid_amount
      )
    ), 0) as outstanding
    from velo_service_records
  `;

  return {
    totalCustomers: Number(counts.total_customers),
    totalBicycles: Number(counts.total_bicycles),
    totalServices: Number(counts.total_services),
    openServices: Number(counts.open_services),
    monthRevenue: Number(revenue.month_revenue),
    outstanding: Number(out.outstanding),
  };
}
