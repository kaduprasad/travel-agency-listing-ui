export interface Agency {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface Car {
  id: string;
  model: string;
  category: string;
  seats: number;
  luggage: number;
  ac: boolean;
  transmission: "manual" | "automatic";
  fuel_type: string;
  local_rate_per_km: number | null;
  intercity_rate_per_km: number | null;
  airport_flat_rate: number | null;
  package_km: number | null;
  package_total: number | null;
  min_km_per_day: number | null;
  driver_charge_per_day: number | null;
  features: string[];
  images: string[];
  primary_image: string;
}

export const AGENCY: Agency = {
  name: "Skyline Travels",
  tagline: "Comfortable rides for every journey",
  description:
    "Skyline Travels offers reliable local, intercity, airport pickup and holiday car rental services in Pune. Choose a vehicle, check the rates, and send your trip details directly to our team.",
  phone: "+91 89995 18604",
  whatsapp: "918999518604",
  email: "hello@skylinetravels.example",
  address: {
    line1: "12 MG Road",
    line2: "Near Central Mall",
    city: "Pune",
    state: "Maharashtra",
    zip: "411001",
  },
};

export const CARS: Car[] = [
  {
    id: "maruti-suzuki-dzire",
    model: "Maruti Suzuki Dzire",
    category: "Sedan",
    seats: 5,
    luggage: 2,
    ac: true,
    transmission: "manual",
    fuel_type: "Petrol",
    local_rate_per_km: 12,
    intercity_rate_per_km: 11,
    airport_flat_rate: 1200,
    package_km: 300,
    package_total: 5000,
    min_km_per_day: 250,
    driver_charge_per_day: 300,
    features: ["Music System", "Charging Port", "First Aid"],
    images: [
      "/cars/maruti-suzuki-dzire-tour-exterior.webp",
      "/cars/maruti-suzuki-dzire.webp",
    ],
    primary_image: "/cars/maruti-suzuki-dzire-tour-exterior.webp",
  },
  {
    id: "maruti-ertiga",
    model: "Maruti Suzuki Ertiga",
    category: "MUV",
    seats: 5,
    luggage: 3,
    ac: true,
    transmission: "manual",
    fuel_type: "Diesel",
    local_rate_per_km: 18,
    intercity_rate_per_km: 17,
    airport_flat_rate: 2200,
    package_km: 300,
    package_total: 7500,
    min_km_per_day: 250,
    driver_charge_per_day: 400,
    features: ["Spacious Cabin", "Music System", "Extra Luggage Space", "Bluetooth"],
    images: [
      "/cars/maruti-ertiga-exterior.webp",
      "/cars/maruti-ertiga-front-seats.webp",
      "/cars/maruti-ertiga-rear-seats.webp",
    ],
    primary_image: "/cars/maruti-ertiga-exterior.webp",
  },
  {
    id: "maruti-alto",
    model: "Maruti Suzuki Alto",
    category: "Hatchback",
    seats: 5,
    luggage: 2,
    ac: true,
    transmission: "manual",
    fuel_type: "Petrol",
    local_rate_per_km: 10,
    intercity_rate_per_km: 10,
    airport_flat_rate: 1000,
    package_km: 300,
    package_total: 4500,
    min_km_per_day: 250,
    driver_charge_per_day: 300,
    features: ["Compact City Ride", "Music System", "Charging Port"],
    images: [
      "/cars/maruti-alto.webp",
      "/cars/maruti-alto-alt2.webp",
    ],
    primary_image: "/cars/maruti-alto.webp",
  },
  {
    id: "chevrolet-enjoy",
    model: "Chevrolet Enjoy",
    category: "MPV",
    seats: 7,
    luggage: 4,
    ac: true,
    transmission: "manual",
    fuel_type: "Diesel",
    local_rate_per_km: 28,
    intercity_rate_per_km: 26,
    airport_flat_rate: null,
    package_km: 300,
    package_total: 12000,
    min_km_per_day: 250,
    driver_charge_per_day: 600,
    features: ["Spacious Cabin", "Music System", "Charging Ports"],
    images: [
      "/cars/chevrolet-enjoy-exterior.webp",
      "/cars/chevrolet-enjoy-interior.webp",
    ],
    primary_image: "/cars/chevrolet-enjoy-exterior.webp",
  },
];
