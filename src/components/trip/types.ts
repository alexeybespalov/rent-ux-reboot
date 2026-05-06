export type TripStatus = "new" | "confirmed" | "in_rent" | "finished" | "done" | "reject";

export interface PriceLine {
  label: string;
  value: number;
  muted?: boolean;
}

export interface PaymentRow {
  id: string;
  type: "RENT" | "DEPOSIT" | "EXTRA";
  direction: "in" | "out";
  party: string;
  amount: number;
  currency: "USD" | "VND";
  status: "Done" | "Not Done";
  method?: string;
  date: string;
  delta?: number;
}

export interface TripData {
  id: number;
  voucher: string;
  source: string;
  siteStatus: "pending" | "synced" | "error";
  issues: { critical: number; total: number; tags: string[] };
  status: TripStatus;
  customer: { name: string; phone: string; email: string; lang: string };
  dates: { start: string; end: string; days: number };
  pickup: string;
  dropoff: string;
  car: { name: string; plate: string };
  protection?: string;
  extras: { name: string; price: number }[];
  notes: string;
  price: { base: number; insurance: number; extras: number; afterHours: number; lateBooking: number; taxRate: number };
  payments: PaymentRow[];
  terms: { mileage: string; freeCancel: string; drivingRules: string; currency: string };
}