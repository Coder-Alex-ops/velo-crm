import fs from "fs/promises";
import path from "path";
import type { Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const now = () => new Date().toISOString();

const seed: Database = {
  customers: [
    {
      id: "cust_demo",
      firstName: "Иван",
      lastName: "Петров",
      phone: "+359 88 123 4567",
      email: "ivan@example.com",
      address: "ул. Витоша 12",
      city: "София",
      notes: "Редовен клиент",
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  bicycles: [
    {
      id: "bike_demo",
      customerId: "cust_demo",
      brand: "Cube",
      model: "Aim SL",
      year: 2022,
      type: "mountain",
      color: "Черен / червен",
      serialNumber: "CB22A12345",
      frameSize: "M (18\")",
      wheelSize: "29\"",
      notes: "С нова предна гума Schwalbe",
      createdAt: now(),
      updatedAt: now(),
    },
  ],
  serviceRecords: [
    {
      id: "srv_demo",
      bicycleId: "bike_demo",
      customerId: "cust_demo",
      receivedDate: new Date().toISOString().slice(0, 10),
      completedDate: undefined,
      workDescription:
        "Цялостен преглед, смяна на верига и касета, регулиране на скорости и спирачки",
      partsList: "Верига KMC X11, касета Shimano CS-HG500 11-42T",
      partsCost: 48,
      laborCost: 20,
      discount: 0,
      paidAmount: 0,
      paymentStatus: "unpaid",
      status: "in_progress",
      technician: "Майстор Георги",
      notes: "Клиентът пита и за нови педали",
      createdAt: now(),
      updatedAt: now(),
    },
  ],
};

async function ensure() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(seed, null, 2), "utf8");
  }
}

export async function readDb(): Promise<Database> {
  await ensure();
  const raw = await fs.readFile(DB_FILE, "utf8");
  const parsed = JSON.parse(raw) as Partial<Database>;
  return {
    customers: parsed.customers ?? [],
    bicycles: parsed.bicycles ?? [],
    serviceRecords: parsed.serviceRecords ?? [],
  };
}

export async function writeDb(db: Database): Promise<void> {
  await ensure();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function updateDb<T>(
  mutator: (db: Database) => T | Promise<T>,
): Promise<T> {
  const db = await readDb();
  const result = await mutator(db);
  await writeDb(db);
  return result;
}

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}${rand}`;
}
