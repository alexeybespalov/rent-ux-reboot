export type TripStatus =
  | "new"
  | "confirmed"
  | "in_rent"
  | "finished"
  | "done"
  | "reject";

export interface TripRow {
  id: number;
  status: TripStatus;
  client: string;
  daysLeft?: number;
  badges?: ("D+" | "R+" | "H" | "OA")[];
  start: string; // ISO
  end: string;   // ISO
  pickup: string;
  dropoff: string;
  car: string;
  plate: string;
  flag?: boolean;
  carIcon?: "ok" | "warn" | "default";
  note?: string;
  priceVnd?: number;
}

const d = (iso: string) => new Date(iso).toISOString();

export const mockTrips: TripRow[] = [
  { id: 559, status: "in_rent", client: "Mikhail", daysLeft: 5, badges: ["D+", "R+"], start: d("2026-05-21T09:53"), end: d("2026-05-24T21:53"), pickup: "Nha Trang", dropoff: "Nha Trang", car: "Mazda CX5", plate: "79A 566.04", note: "New" },
  { id: 553, status: "in_rent", client: "Client", daysLeft: 5, badges: ["D+", "R+"], start: d("2026-05-20T09:46"), end: d("2026-05-22T21:46"), pickup: "VinRent", dropoff: "VinRent", car: "Huyndai Stargazer", plate: "51M 857.12", note: "New" },
  { id: 552, status: "in_rent", client: "Client", daysLeft: 5, badges: ["D+", "R+"], start: d("2026-05-20T09:44"), end: d("2026-05-23T21:00"), pickup: "Cam Ranh", dropoff: "Cam Ranh", car: "Huyndai Custin", plate: "79A 481.72", note: "New" },
  { id: 546, status: "in_rent", client: "Martin Slesar", daysLeft: 5, badges: ["D+", "R+"], start: d("2026-05-19T11:00"), end: d("2026-05-25T11:00"), pickup: "Cam Ranh", dropoff: "Cam Ranh", car: "Vinfast Lux A", plate: "79A 415.43", note: "VinRent Website Days: 6 Price: 9,184,880 VND", priceVnd: 9184880 },
  { id: 550, status: "in_rent", client: "Stepkina", daysLeft: 5, badges: ["D+", "R+"], start: d("2026-05-18T15:50"), end: d("2026-05-27T15:50"), pickup: "Nha Trang", dropoff: "Nha Trang", car: "Suziki XL7", plate: "50E 059.41", note: "Payment from getrentacar" },
  { id: 531, status: "in_rent", client: "Mangee", daysLeft: 3, badges: ["D+"], start: d("2026-05-05T06:00"), end: d("2026-06-05T21:00"), pickup: "VinRent", dropoff: "VinRent", car: "Hyundai Stargazer", plate: "79A 747.73", note: "New" },
  { id: 428, status: "in_rent", client: "Alisa", daysLeft: 3, badges: ["D+"], start: d("2026-04-10T09:48"), end: d("2026-06-10T09:48"), pickup: "VinRent", dropoff: "VinRent", car: "Chevrolet Cruze", plate: "79A 494.76", flag: true, note: "New" },
  { id: 515, status: "confirmed", client: "Asya", daysLeft: 10, start: d("2026-06-15T22:27"), end: d("2026-06-22T22:27"), pickup: "—", dropoff: "—", car: "—", plate: "", note: "Xl7, carens, stargazer" },
  { id: 439, status: "confirmed", client: "Роман Демин", daysLeft: 10, start: d("2026-07-18T07:00"), end: d("2026-07-21T11:00"), pickup: "—", dropoff: "—", car: "—", plate: "", note: "VinRent Website Days: 4 Price: 4,622,400 VND", priceVnd: 4622400 },
  { id: 427, status: "confirmed", client: "Dmitriy Yakubov", daysLeft: 8, start: d("2026-07-23T10:00"), end: d("2026-08-13T06:00"), pickup: "Cam Ranh", dropoff: "Cam Ranh", car: "—", plate: "", note: "VinRent Website Days: 21 Price: 20,854,300 VND", priceVnd: 20854300 },
  { id: 426, status: "confirmed", client: "Dmitriy Yakubov", daysLeft: 10, start: d("2026-07-23T10:00"), end: d("2026-08-13T06:00"), pickup: "—", dropoff: "—", car: "—", plate: "", note: "VinRent Website Days: 21 Price: 20,854,300 VND", priceVnd: 20854300 },
  { id: 514, status: "confirmed", client: "Matthew Brown", daysLeft: 10, start: d("2026-07-24T09:30"), end: d("2026-07-27T17:30"), pickup: "—", dropoff: "—", car: "—", plate: "", note: "VinRent Website Days: 4 Price: 5,178,800 VND", priceVnd: 5178800 },
  { id: 540, status: "in_rent", client: "Client", daysLeft: 5, badges: ["D+", "R+"], start: d("2026-05-16T06:00"), end: d("2026-08-16T21:00"), pickup: "VinRent", dropoff: "VinRent", car: "Vinfast Lux A", plate: "75A 440.24", note: "New" },
  { id: 520, status: "confirmed", client: "Hojae Lee", daysLeft: 10, start: d("2026-12-26T17:00"), end: d("2026-12-30T17:00"), pickup: "—", dropoff: "—", car: "—", plate: "", note: "VinRent Website Days: 4 Price: 5,264,400 VND", priceVnd: 5264400 },
  { id: 555, status: "confirmed", client: "Айжана", daysLeft: 6, start: d("2025-05-22T06:00"), end: d("2025-05-24T21:00"), pickup: "VinRent", dropoff: "VinRent", car: "Suzuki XL7", plate: "51M 384.77", note: "Telegram Dialog" },
  { id: 12,  status: "finished", client: "Andrey A", start: d("2026-01-04T08:00"), end: d("2026-01-06T21:00"), pickup: "VinRent", dropoff: "VinRent", car: "Kia K3", plate: "79A 620.74", carIcon: "ok", note: "Alex = deposit overpayment" },
  { id: 29,  status: "finished", client: "Ivo Shandor", badges: ["OA"], start: d("2026-01-14T10:00"), end: d("2026-01-24T10:00"), pickup: "VinRent", dropoff: "VinRent", car: "Mazda CX5", plate: "79A 508.06", carIcon: "ok", note: "Sergey crpt. Я депозит вернул Sergio." },
  { id: 184, status: "finished", client: "Yurim", daysLeft: 14, badges: ["OA"], start: d("2026-01-26T15:29"), end: d("2026-01-30T15:29"), pickup: "Nha Trang", dropoff: "Cam Ranh", car: "Mitsubishi Xpander", plate: "79A 693.26", carIcon: "ok", note: "Сергей вычтет из депозита" },
  { id: 178, status: "finished", client: "Marat", daysLeft: 3, badges: ["OA"], start: d("2026-01-30T10:15"), end: d("2026-02-02T10:57"), pickup: "VinRent", dropoff: "VinRent", car: "Mitsubishi Xpander", plate: "79A 619.48", carIcon: "ok", note: "- бустер 10$. Нет его. Надо купить. бусте..." },
  { id: 220, status: "finished", client: "Jerry", daysLeft: 12, badges: ["OA"], start: d("2026-02-07T09:13"), end: d("2026-02-08T10:13"), pickup: "VinRent", dropoff: "VinRent", car: "Kia Cerato", plate: "79A 619.48", carIcon: "ok", note: "New" },
  { id: 205, status: "finished", client: "Ulan Kylychbaev", daysLeft: 12, badges: ["OA"], start: d("2026-02-04T11:00"), end: d("2026-02-08T16:00"), pickup: "VinRent", dropoff: "VinRent", car: "Kia K3", plate: "79A 573.32", carIcon: "ok", note: "+ 1 day . Alex + Sergey check usd where ? L..." },
  { id: 263, status: "finished", client: "xpander client", start: d("2026-02-08T17:03"), end: d("2026-02-12T17:03"), pickup: "VinRent", dropoff: "VinRent", car: "Mitsubishi Xpander", plate: "79A 619.48", carIcon: "ok", note: "New" },
  { id: 201, status: "finished", client: "Sv", badges: ["OA"], start: d("2026-02-01T21:38"), end: d("2026-03-01T09:38"), pickup: "VinRent", dropoff: "VinRent", car: "Kia Sedona", plate: "79A 342.67", carIcon: "ok" },
  { id: 240, status: "finished", client: "Lucky", daysLeft: 13, badges: ["OA", "H"], start: d("2026-02-08T15:19"), end: d("2026-03-08T09:00"), pickup: "VinRent", dropoff: "VinRent", car: "Mazda 3", plate: "79A 561.13", flag: true, note: "Alex to close" },
  { id: 334, status: "finished", client: "Lucky", daysLeft: 18, badges: ["D+", "R+", "OA"], start: d("2026-03-08T15:43"), end: d("2026-03-09T20:43"), pickup: "VinRent", dropoff: "VinRent", car: "Toyota Vios", plate: "51M 803.54", note: "Alex pls tell client." },
  { id: 330, status: "finished", client: "Igor", start: d("2026-03-07T11:50"), end: d("2026-03-12T11:50"), pickup: "VinRent", dropoff: "VinRent", car: "Vinfast Fadil", plate: "79A 288.59", note: "20 USD - deposit" },
  { id: 342, status: "finished", client: "Anna", start: d("2026-03-09T18:46"), end: d("2026-03-14T18:46"), pickup: "Cam Ranh", dropoff: "Cam Ranh", car: "Suzuki XL7", plate: "51M 384.77", note: "Alex to close" },
  { id: 343, status: "finished", client: "Dmitry", start: d("2026-03-10T16:30"), end: d("2026-03-15T16:30"), pickup: "VinRent", dropoff: "VinRent", car: "Toyota Vios", plate: "79A 803.54", note: "Sergey done. Harry ?" },
  { id: 354, status: "finished", client: "Marat", daysLeft: 2, badges: ["OA"], start: d("2026-03-15T18:22"), end: d("2026-03-20T18:22"), pickup: "Cam Ranh", dropoff: "Cam Ranh", car: "Suzuki XL7", plate: "51M 384.77", note: "Sergey done. Harry ?" },
  { id: 338, status: "finished", client: "VASILII POPOV", daysLeft: 16, badges: ["OA"], start: d("2026-03-21T17:25"), end: d("2026-03-25T15:25"), pickup: "Nha Trang", dropoff: "Cam Ranh", car: "Vinfast Fadil", plate: "79A 288.59", note: "Sergey Done. Harry ?" },
  { id: 355, status: "finished", client: "Ruslan Kamalov", daysLeft: 2, start: d("2026-03-19T19:29"), end: d("2026-03-27T16:00"), pickup: "Cam Ranh", dropoff: "Cam Ranh", car: "Kia Carens", plate: "79A 607.06" },
  { id: 397, status: "finished", client: "Alex", badges: ["D+", "R+", "OA"], start: d("2026-03-27T16:34"), end: d("2026-03-27T16:34"), pickup: "Cam Ranh", dropoff: "Cam Ranh", car: "Toyota Fortuner", plate: "79A 338.80", note: "Alex to close" },
  { id: 381, status: "finished", client: "Alexander", start: d("2026-03-21T07:56"), end: d("2026-03-28T07:56"), pickup: "Nha Trang", dropoff: "Nha Trang", car: "Suzuki XL7", plate: "51M 384.77", note: "New" },
  { id: 382, status: "finished", client: "Alexander", daysLeft: 13, badges: ["OA"], start: d("2026-03-21T07:57"), end: d("2026-03-28T07:57"), pickup: "Nha Trang", dropoff: "Nha Trang", car: "Kia Sedona", plate: "79A 681.98", note: "50$ была предоплата PayPal" },
  { id: 313, status: "finished", client: "Nikita Makarov", daysLeft: 14, badges: ["OA"], start: d("2026-03-10T10:16"), end: d("2026-03-28T10:16"), pickup: "VinRent", dropoff: "VinRent", car: "Vinfast VF3", plate: "79A 669.26", note: "отдаст за епасс. постоянный клиент" },
  { id: 369, status: "finished", client: "Eduard Galojan", start: d("2026-03-16T10:14"), end: d("2026-03-30T10:14"), pickup: "VinRent", dropoff: "VinRent", car: "Toyota Vios", plate: "51M 803.54", note: "Alex to close" },
];