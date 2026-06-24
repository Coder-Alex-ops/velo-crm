import type {
  BikeType,
  Bicycle,
  Customer,
  PaymentStatus,
  ServiceRecord,
  ServiceStatus,
} from "./types";

export const BIKE_TYPES: { value: BikeType; label: string }[] = [
  { value: "mountain", label: "Планински (MTB)" },
  { value: "road", label: "Шосеен" },
  { value: "city", label: "Градски" },
  { value: "hybrid", label: "Хибриден" },
  { value: "electric", label: "Електрически" },
  { value: "gravel", label: "Чакъл (Gravel)" },
  { value: "bmx", label: "BMX" },
  { value: "kids", label: "Детски" },
  { value: "other", label: "Друг" },
];

export const SERVICE_STATUSES: {
  value: ServiceStatus;
  label: string;
  color: string;
  bg: string;
  text: string;
}[] = [
  {
    value: "received",
    label: "Приет",
    color: "#6b7280",
    bg: "bg-gray-100",
    text: "text-gray-700",
  },
  {
    value: "in_progress",
    label: "В сервиз",
    color: "#0284c7",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  {
    value: "waiting_parts",
    label: "Чака части",
    color: "#b45309",
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  {
    value: "ready",
    label: "Готов",
    color: "#16a34a",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  {
    value: "delivered",
    label: "Предаден",
    color: "#7c3aed",
    bg: "bg-violet-100",
    text: "text-violet-700",
  },
  {
    value: "cancelled",
    label: "Отказан",
    color: "#dc2626",
    bg: "bg-red-100",
    text: "text-red-700",
  },
];

export const PAYMENT_STATUSES: {
  value: PaymentStatus;
  label: string;
  bg: string;
  text: string;
}[] = [
  { value: "unpaid", label: "Неплатено", bg: "bg-red-100", text: "text-red-700" },
  { value: "partial", label: "Частично", bg: "bg-amber-100", text: "text-amber-700" },
  { value: "paid", label: "Платено", bg: "bg-green-100", text: "text-green-700" },
];

export function bikeTypeLabel(type?: BikeType): string {
  if (!type) return "—";
  return BIKE_TYPES.find((b) => b.value === type)?.label ?? type;
}

export function serviceStatusMeta(status: ServiceStatus) {
  return (
    SERVICE_STATUSES.find((s) => s.value === status) ?? SERVICE_STATUSES[0]
  );
}

export function paymentStatusMeta(status: PaymentStatus) {
  return (
    PAYMENT_STATUSES.find((p) => p.value === status) ?? PAYMENT_STATUSES[0]
  );
}

export function customerFullName(c?: Customer | null): string {
  if (!c) return "—";
  return `${c.firstName} ${c.lastName}`.trim();
}

export function bicycleLabel(b?: Bicycle | null): string {
  if (!b) return "—";
  const parts = [b.brand, b.model].filter(Boolean);
  const base = parts.join(" ") || "Велосипед";
  return b.year ? `${base} (${b.year})` : base;
}

export function serviceTotal(s: ServiceRecord): number {
  return Math.max(
    0,
    (s.partsCost ?? 0) + (s.laborCost ?? 0) - (s.discount ?? 0),
  );
}

export function serviceBalance(s: ServiceRecord): number {
  return serviceTotal(s) - (s.paidAmount ?? 0);
}

const EURO_FORMATTER = new Intl.NumberFormat("bg-BG", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEur(n: number): string {
  return EURO_FORMATTER.format(n);
}

export function computePaymentStatus(
  total: number,
  paid: number,
): PaymentStatus {
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  return "partial";
}
