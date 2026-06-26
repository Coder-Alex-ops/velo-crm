import "server-only";
import postgres from "postgres";
import type {
  Bicycle,
  Customer,
  Organization,
  PaymentStatus,
  Product,
  ProductCategory,
  ServicePart,
  ServiceRecord,
  ServiceStatus,
  StockMovement,
  StockMovementType,
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

type OrganizationRow = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

type UserRow = {
  id: string;
  organization_id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
};

type UserWithHashRow = UserRow & { password_hash: string };

type CustomerRow = {
  id: string;
  organization_id: string;
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
  organization_id: string;
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
  organization_id: string;
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

export function mapOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function mapUser(row: UserRow): User {
  return {
    id: row.id,
    organizationId: row.organization_id,
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

// ---------- Organizations ----------

export async function createOrganization(name: string): Promise<Organization> {
  const rows = await sql<OrganizationRow[]>`
    insert into velo_organizations (name)
    values (${name})
    returning *
  `;
  return mapOrganization(rows[0]);
}

export async function getOrganization(id: string): Promise<Organization | null> {
  const rows = await sql<OrganizationRow[]>`
    select * from velo_organizations where id = ${id} limit 1
  `;
  return rows[0] ? mapOrganization(rows[0]) : null;
}

// ---------- Users ----------

export async function findUserByEmail(
  email: string,
): Promise<(User & { passwordHash: string }) | null> {
  const rows = await sql<UserWithHashRow[]>`
    select id, organization_id, email, name, role, password_hash, created_at, updated_at
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
    select id, organization_id, email, name, role, created_at, updated_at
    from velo_users
    where id = ${id}
    limit 1
  `;
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function listUsers(orgId: string): Promise<User[]> {
  const rows = await sql<UserRow[]>`
    select id, organization_id, email, name, role, created_at, updated_at
    from velo_users
    where organization_id = ${orgId}
    order by name
  `;
  return rows.map(mapUser);
}

export async function createUser(input: {
  organizationId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
}): Promise<User> {
  const rows = await sql<UserRow[]>`
    insert into velo_users (organization_id, email, password_hash, name, role)
    values (${input.organizationId}, ${input.email}, ${input.passwordHash}, ${input.name}, ${input.role})
    returning id, organization_id, email, name, role, created_at, updated_at
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

export async function listCustomers(orgId: string): Promise<Customer[]> {
  const rows = await sql<CustomerRow[]>`
    select * from velo_customers
    where organization_id = ${orgId}
    order by last_name, first_name
  `;
  return rows.map(mapCustomer);
}

export async function getCustomer(orgId: string, id: string): Promise<Customer | null> {
  const rows = await sql<CustomerRow[]>`
    select * from velo_customers
    where organization_id = ${orgId} and id = ${id}
    limit 1
  `;
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function createCustomerRow(input: {
  organizationId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
}): Promise<Customer> {
  const rows = await sql<CustomerRow[]>`
    insert into velo_customers (organization_id, first_name, last_name, phone, email, address, city, notes)
    values (
      ${input.organizationId},
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
  orgId: string,
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
    where organization_id = ${orgId} and id = ${id}
    returning *
  `;
  return rows[0] ? mapCustomer(rows[0]) : null;
}

export async function deleteCustomerRow(orgId: string, id: string): Promise<void> {
  await sql`delete from velo_customers where organization_id = ${orgId} and id = ${id}`;
}

// ---------- Bicycles ----------

export async function listBicycles(orgId: string): Promise<Bicycle[]> {
  const rows = await sql<BicycleRow[]>`
    select * from velo_bicycles
    where organization_id = ${orgId}
    order by brand, model
  `;
  return rows.map(mapBicycle);
}

export async function listBicyclesByCustomer(
  orgId: string,
  customerId: string,
): Promise<Bicycle[]> {
  const rows = await sql<BicycleRow[]>`
    select * from velo_bicycles
    where organization_id = ${orgId} and customer_id = ${customerId}
    order by brand, model
  `;
  return rows.map(mapBicycle);
}

export async function getBicycle(orgId: string, id: string): Promise<Bicycle | null> {
  const rows = await sql<BicycleRow[]>`
    select * from velo_bicycles
    where organization_id = ${orgId} and id = ${id}
    limit 1
  `;
  return rows[0] ? mapBicycle(rows[0]) : null;
}

export async function createBicycleRow(input: {
  organizationId: string;
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
      organization_id, customer_id, brand, model, year, type, color,
      serial_number, frame_size, wheel_size, notes
    ) values (
      ${input.organizationId},
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
  orgId: string,
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
    where organization_id = ${orgId} and id = ${id}
    returning *
  `;
  return rows[0] ? mapBicycle(rows[0]) : null;
}

export async function deleteBicycleRow(orgId: string, id: string): Promise<void> {
  await sql`delete from velo_bicycles where organization_id = ${orgId} and id = ${id}`;
}

// ---------- Service Records ----------

export async function listServiceRecords(orgId: string): Promise<ServiceRecord[]> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records
    where organization_id = ${orgId}
    order by received_date desc, created_at desc
  `;
  return rows.map(mapService);
}

export async function listServiceRecordsByStatus(
  orgId: string,
  status: ServiceStatus,
): Promise<ServiceRecord[]> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records
    where organization_id = ${orgId} and status = ${status}
    order by received_date desc, created_at desc
  `;
  return rows.map(mapService);
}

export async function listServiceRecordsByCustomer(
  orgId: string,
  customerId: string,
): Promise<ServiceRecord[]> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records
    where organization_id = ${orgId} and customer_id = ${customerId}
    order by received_date desc, created_at desc
  `;
  return rows.map(mapService);
}

export async function listServiceRecordsByBicycle(
  orgId: string,
  bicycleId: string,
): Promise<ServiceRecord[]> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records
    where organization_id = ${orgId} and bicycle_id = ${bicycleId}
    order by received_date desc, created_at desc
  `;
  return rows.map(mapService);
}

export async function getServiceRecord(
  orgId: string,
  id: string,
): Promise<ServiceRecord | null> {
  const rows = await sql<ServiceRow[]>`
    select * from velo_service_records
    where organization_id = ${orgId} and id = ${id}
    limit 1
  `;
  return rows[0] ? mapService(rows[0]) : null;
}

export async function createServiceRecordRow(input: {
  organizationId: string;
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
      organization_id, bicycle_id, customer_id, received_date, completed_date,
      work_description, parts_list, parts_cost, labor_cost,
      discount, paid_amount, payment_status, status, technician, notes
    ) values (
      ${input.organizationId},
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
  orgId: string,
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
    where organization_id = ${orgId} and id = ${id}
    returning *
  `;
  return rows[0] ? mapService(rows[0]) : null;
}

export async function deleteServiceRecordRow(orgId: string, id: string): Promise<void> {
  await sql`delete from velo_service_records where organization_id = ${orgId} and id = ${id}`;
}

// ---------- Dashboard helpers ----------

export async function getDashboardStats(orgId: string): Promise<{
  totalCustomers: number;
  totalBicycles: number;
  totalServices: number;
  openServices: number;
  monthRevenue: number;
  outstanding: number;
  lowStockCount: number;
}> {
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .slice(0, 10);

  const [row] = await sql<
    {
      total_customers: string;
      total_bicycles: string;
      total_services: string;
      open_services: string;
      month_revenue: string;
      outstanding: string;
      low_stock_count: string;
    }[]
  >`
    select
      (select count(*) from velo_customers where organization_id = ${orgId}) as total_customers,
      (select count(*) from velo_bicycles where organization_id = ${orgId}) as total_bicycles,
      (select count(*) from velo_service_records where organization_id = ${orgId}) as total_services,
      (select count(*) from velo_service_records
        where organization_id = ${orgId} and status not in ('delivered', 'cancelled')) as open_services,
      coalesce((
        select sum(greatest(0, parts_cost + labor_cost - discount))
        from velo_service_records
        where organization_id = ${orgId} and received_date >= ${monthStart}
      ), 0) as month_revenue,
      coalesce((
        select sum(greatest(0, greatest(0, parts_cost + labor_cost - discount) - paid_amount))
        from velo_service_records
        where organization_id = ${orgId}
      ), 0) as outstanding,
      (select count(*) from velo_products
        where organization_id = ${orgId} and quantity <= low_stock_threshold) as low_stock_count
  `;

  return {
    totalCustomers: Number(row.total_customers),
    totalBicycles: Number(row.total_bicycles),
    totalServices: Number(row.total_services),
    openServices: Number(row.open_services),
    monthRevenue: Number(row.month_revenue),
    outstanding: Number(row.outstanding),
    lowStockCount: Number(row.low_stock_count),
  };
}

// ---------- Enriched queries for list pages ----------

type ServiceWithDetailsRow = ServiceRow & {
  c_first: string | null;
  c_last: string | null;
  b_brand: string | null;
  b_model: string | null;
  b_year: number | null;
};

export type ServiceWithDetails = ServiceRecord & {
  customerName: string;
  bicycleName: string;
};

function formatCustomerName(first: string | null, last: string | null): string {
  return [first, last].filter(Boolean).join(" ").trim() || "—";
}

function formatBicycleName(
  brand: string | null,
  model: string | null,
  year: number | null,
): string {
  const base = [brand, model].filter(Boolean).join(" ") || "Велосипед";
  return year ? `${base} (${year})` : base;
}

function mapServiceWithDetails(row: ServiceWithDetailsRow): ServiceWithDetails {
  return {
    ...mapService(row),
    customerName: formatCustomerName(row.c_first, row.c_last),
    bicycleName: formatBicycleName(row.b_brand, row.b_model, row.b_year),
  };
}

export async function listServicesWithDetails(
  orgId: string,
  status?: ServiceStatus,
  limit?: number,
): Promise<ServiceWithDetails[]> {
  const rows = await sql<ServiceWithDetailsRow[]>`
    select
      s.*,
      c.first_name as c_first,
      c.last_name  as c_last,
      b.brand      as b_brand,
      b.model      as b_model,
      b.year       as b_year
    from velo_service_records s
    left join velo_customers c on c.id = s.customer_id
    left join velo_bicycles  b on b.id = s.bicycle_id
    where s.organization_id = ${orgId}
    ${status ? sql`and s.status = ${status}` : sql``}
    order by s.received_date desc, s.created_at desc
    ${limit != null ? sql`limit ${limit}` : sql``}
  `;
  return rows.map(mapServiceWithDetails);
}

type BicycleWithCustomerRow = BicycleRow & {
  c_first: string | null;
  c_last: string | null;
};

export type BicycleWithCustomer = Bicycle & {
  customerName: string;
};

export async function listBicyclesWithCustomer(orgId: string): Promise<BicycleWithCustomer[]> {
  const rows = await sql<BicycleWithCustomerRow[]>`
    select b.*, c.first_name as c_first, c.last_name as c_last
    from velo_bicycles b
    left join velo_customers c on c.id = b.customer_id
    where b.organization_id = ${orgId}
    order by b.brand, b.model
  `;
  return rows.map((row) => ({
    ...mapBicycle(row),
    customerName: formatCustomerName(row.c_first, row.c_last),
  }));
}

export async function countBicyclesByCustomer(orgId: string): Promise<Map<string, number>> {
  const rows = await sql<{ customer_id: string; count: string }[]>`
    select customer_id, count(*) as count
    from velo_bicycles
    where organization_id = ${orgId}
    group by customer_id
  `;
  return new Map(rows.map((r) => [r.customer_id, Number(r.count)]));
}

export async function countServicesByCustomer(orgId: string): Promise<Map<string, number>> {
  const rows = await sql<{ customer_id: string; count: string }[]>`
    select customer_id, count(*) as count
    from velo_service_records
    where organization_id = ${orgId}
    group by customer_id
  `;
  return new Map(rows.map((r) => [r.customer_id, Number(r.count)]));
}

export async function countServicesByBicycle(orgId: string): Promise<Map<string, number>> {
  const rows = await sql<{ bicycle_id: string; count: string }[]>`
    select bicycle_id, count(*) as count
    from velo_service_records
    where organization_id = ${orgId}
    group by bicycle_id
  `;
  return new Map(rows.map((r) => [r.bicycle_id, Number(r.count)]));
}

export async function countServicesByStatus(orgId: string): Promise<Map<string, number>> {
  const rows = await sql<{ status: string; count: string }[]>`
    select status, count(*) as count
    from velo_service_records
    where organization_id = ${orgId}
    group by status
  `;
  return new Map(rows.map((r) => [r.status, Number(r.count)]));
}

// ---------- Products ----------

type ProductRow = {
  id: string;
  organization_id: string;
  sku: string | null;
  name: string;
  category: string | null;
  description: string | null;
  unit_price: string;
  quantity: number;
  low_stock_threshold: number;
  created_at: Date;
  updated_at: Date;
};

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category as ProductCategory | null,
    description: row.description,
    unitPrice: Number(row.unit_price),
    quantity: row.quantity,
    lowStockThreshold: row.low_stock_threshold,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export async function listProducts(orgId: string): Promise<Product[]> {
  const rows = await sql<ProductRow[]>`
    select * from velo_products
    where organization_id = ${orgId}
    order by name
  `;
  return rows.map(mapProduct);
}

export async function listLowStockProducts(orgId: string): Promise<Product[]> {
  const rows = await sql<ProductRow[]>`
    select * from velo_products
    where organization_id = ${orgId} and quantity <= low_stock_threshold
    order by quantity asc, name
  `;
  return rows.map(mapProduct);
}

export async function getProduct(orgId: string, id: string): Promise<Product | null> {
  const rows = await sql<ProductRow[]>`
    select * from velo_products
    where organization_id = ${orgId} and id = ${id}
    limit 1
  `;
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function getProductBySku(orgId: string, sku: string): Promise<Product | null> {
  const rows = await sql<ProductRow[]>`
    select * from velo_products
    where organization_id = ${orgId} and sku = ${sku}
    limit 1
  `;
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function createProductRow(input: {
  organizationId: string;
  sku?: string;
  name: string;
  category?: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  lowStockThreshold: number;
}): Promise<Product> {
  const rows = await sql<ProductRow[]>`
    insert into velo_products (organization_id, sku, name, category, description, unit_price, quantity, low_stock_threshold)
    values (
      ${input.organizationId},
      ${input.sku ?? null},
      ${input.name},
      ${input.category ?? null},
      ${input.description ?? null},
      ${input.unitPrice},
      ${input.quantity},
      ${input.lowStockThreshold}
    )
    returning *
  `;
  return mapProduct(rows[0]);
}

export async function updateProductRow(
  orgId: string,
  id: string,
  input: {
    sku?: string;
    name: string;
    category?: string;
    description?: string;
    unitPrice: number;
    lowStockThreshold: number;
  },
): Promise<Product | null> {
  const rows = await sql<ProductRow[]>`
    update velo_products set
      sku = ${input.sku ?? null},
      name = ${input.name},
      category = ${input.category ?? null},
      description = ${input.description ?? null},
      unit_price = ${input.unitPrice},
      low_stock_threshold = ${input.lowStockThreshold},
      updated_at = now()
    where organization_id = ${orgId} and id = ${id}
    returning *
  `;
  return rows[0] ? mapProduct(rows[0]) : null;
}

export async function deleteProductRow(orgId: string, id: string): Promise<void> {
  await sql`delete from velo_products where organization_id = ${orgId} and id = ${id}`;
}

// ---------- Stock Movements ----------

type StockMovementRow = {
  id: string;
  organization_id: string;
  product_id: string;
  type: string;
  quantity_delta: number;
  reference: string | null;
  note: string | null;
  created_at: Date;
};

function mapStockMovement(row: StockMovementRow): StockMovement {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.type as StockMovementType,
    quantityDelta: row.quantity_delta,
    reference: row.reference,
    note: row.note,
    createdAt: iso(row.created_at),
  };
}

export async function createStockMovement(input: {
  organizationId: string;
  productId: string;
  type: StockMovementType;
  quantityDelta: number;
  reference?: string;
  note?: string;
}): Promise<StockMovement> {
  const [movement] = await sql.begin(async (tx) => {
    const movements = await tx<StockMovementRow[]>`
      insert into velo_stock_movements (organization_id, product_id, type, quantity_delta, reference, note)
      values (
        ${input.organizationId},
        ${input.productId},
        ${input.type},
        ${input.quantityDelta},
        ${input.reference ?? null},
        ${input.note ?? null}
      )
      returning *
    `;
    await tx`
      update velo_products
      set quantity = quantity + ${input.quantityDelta}, updated_at = now()
      where organization_id = ${input.organizationId} and id = ${input.productId}
    `;
    return movements;
  });
  return mapStockMovement(movement);
}

export async function checkStockMovementExists(
  orgId: string,
  type: StockMovementType,
  reference: string,
): Promise<boolean> {
  const rows = await sql<{ id: string }[]>`
    select id from velo_stock_movements
    where organization_id = ${orgId} and type = ${type} and reference = ${reference}
    limit 1
  `;
  return rows.length > 0;
}

export async function listStockMovementsByProduct(
  orgId: string,
  productId: string,
): Promise<StockMovement[]> {
  const rows = await sql<StockMovementRow[]>`
    select * from velo_stock_movements
    where organization_id = ${orgId} and product_id = ${productId}
    order by created_at desc
  `;
  return rows.map(mapStockMovement);
}

// ---------- Service Parts ----------

type ServicePartRow = {
  id: string;
  service_id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  created_at: Date;
};

function mapServicePart(row: ServicePartRow): ServicePart {
  return {
    id: row.id,
    serviceId: row.service_id,
    productId: row.product_id,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    createdAt: iso(row.created_at),
  };
}

export async function listServicePartsByService(
  serviceId: string,
): Promise<ServicePart[]> {
  const rows = await sql<ServicePartRow[]>`
    select * from velo_service_parts where service_id = ${serviceId}
    order by created_at
  `;
  return rows.map(mapServicePart);
}

export async function replaceServiceParts(
  orgId: string,
  serviceId: string,
  parts: { productId: string; quantity: number; unitPrice: number }[],
): Promise<void> {
  await sql.begin(async (tx) => {
    const existing = await tx<{ product_id: string; quantity: number }[]>`
      select product_id, quantity from velo_service_parts where service_id = ${serviceId}
    `;

    await tx`delete from velo_service_parts where service_id = ${serviceId}`;

    for (const old of existing) {
      await tx`
        update velo_products
        set quantity = quantity + ${old.quantity}, updated_at = now()
        where organization_id = ${orgId} and id = ${old.product_id}
      `;
      await tx`
        insert into velo_stock_movements (organization_id, product_id, type, quantity_delta, reference, note)
        values (${orgId}, ${old.product_id}, 'adjustment', ${old.quantity}, ${serviceId}, 'Корекция при редакция на сервиз')
      `;
    }

    if (parts.length === 0) return;

    for (const p of parts) {
      await tx`
        insert into velo_service_parts (service_id, product_id, quantity, unit_price)
        values (${serviceId}, ${p.productId}, ${p.quantity}, ${p.unitPrice})
      `;
      await tx`
        update velo_products
        set quantity = quantity - ${p.quantity}, updated_at = now()
        where organization_id = ${orgId} and id = ${p.productId}
      `;
      await tx`
        insert into velo_stock_movements (organization_id, product_id, type, quantity_delta, reference, note)
        values (${orgId}, ${p.productId}, 'service_use', ${-p.quantity}, ${serviceId}, 'Използвано в сервиз')
      `;
    }
  });
}
