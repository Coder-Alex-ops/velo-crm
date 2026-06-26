export type UserRole = "admin" | "mechanic";

export type Organization = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BikeType =
  | "mountain"
  | "road"
  | "city"
  | "hybrid"
  | "electric"
  | "bmx"
  | "kids"
  | "gravel"
  | "other";

export type Bicycle = {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  year?: number | null;
  type?: BikeType | null;
  color?: string | null;
  serialNumber?: string | null;
  frameSize?: string | null;
  wheelSize?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ServiceStatus =
  | "received"
  | "in_progress"
  | "waiting_parts"
  | "ready"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "partial" | "paid";

export type ProductCategory =
  | "chain"
  | "cassette"
  | "tire"
  | "brake"
  | "cable"
  | "accessory"
  | "other";

export type Product = {
  id: string;
  sku?: string | null;
  name: string;
  category?: ProductCategory | null;
  description?: string | null;
  unitPrice: number;
  quantity: number;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
};

export type StockMovementType =
  | "pos_sale"
  | "service_use"
  | "purchase"
  | "adjustment";

export type StockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantityDelta: number;
  reference?: string | null;
  note?: string | null;
  createdAt: string;
};

export type ServicePart = {
  id: string;
  serviceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
};

export type ServiceRecord = {
  id: string;
  bicycleId: string;
  customerId: string;
  receivedDate: string;
  completedDate?: string | null;
  workDescription: string;
  partsList?: string | null;
  partsCost: number;
  laborCost: number;
  discount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  status: ServiceStatus;
  technician?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};
