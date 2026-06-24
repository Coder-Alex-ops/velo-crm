export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
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
  year?: number;
  type?: BikeType;
  color?: string;
  serialNumber?: string;
  frameSize?: string;
  wheelSize?: string;
  notes?: string;
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

export type ServiceRecord = {
  id: string;
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
  createdAt: string;
  updatedAt: string;
};

export type Database = {
  customers: Customer[];
  bicycles: Bicycle[];
  serviceRecords: ServiceRecord[];
};
