export const SITE_NAME = "Skyline Travels";
export const SITE_DESCRIPTION =
  "Skyline Travels — Reliable local, intercity, airport pickup & holiday car rentals. Transparent per-km pricing and instant booking.";

export const DEFAULT_AGENCY_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_AGENCY_SLUG ?? "skyline-travels";

export const TRAVEL_TYPES = [
  { value: "local", label: "Local", icon: "MapPin", description: "Within-city trips, hourly or per km" },
  { value: "intercity", label: "Inter City", icon: "Route", description: "Outstation round-trip or one-way" },
  { value: "airport", label: "Pickup & Drop", icon: "Plane", description: "Airport and railway transfers" },
  { value: "package", label: "Trip Package", icon: "Gift", description: "Fixed-price holiday packages" },
] as const;

export type TravelType = (typeof TRAVEL_TYPES)[number]["value"];

export const ADMIN_ROLES = ["agency_admin", "super_admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ENQUIRY_STATUSES = ["new", "contacted", "confirmed", "closed", "cancelled"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
