import { VEHICLE_RATES, type VehicleId, type VehicleRates } from "@/lib/data/vehicle-rates";

export interface Agency {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
}

export interface Car {
  id: VehicleId;
  model: string;
  category: string;
  seats: number | null;
  luggage: number | null;
  ac: boolean | null;
  transmission: "manual" | "automatic" | null;
  fuel_type: string | null;
  rates: VehicleRates;
  features: string[];
  images: string[];
  primary_image: string | null;
}

export const AGENCY: Agency = {
  name: "Skyline Travels",
  tagline: "Comfortable rides for every journey",
  description:
    "Skyline Travels offers reliable local, intercity, airport pickup and holiday car and bus rental services in Pune. Choose a vehicle, check available rates, and send your trip details directly to our team.",
  phone: "+91 89995 18604",
  whatsapp: "918999518604",
  email: "mkshirsagar878@gmail.com",
  address: "Sai Vihar Colony, Kalepadal, Hadapsar, Pune 28",
};

const VEHICLES: Omit<Car, "rates">[] = [
  {
    id: "maruti-suzuki-dzire",
    model: "Maruti Suzuki Dzire",
    category: "Sedan",
    seats: 5,
    luggage: 2,
    ac: true,
    transmission: "manual",
    fuel_type: "Petrol",
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
    features: ["Spacious Cabin", "Music System", "Extra Luggage Space", "Bluetooth"],
    images: [
      "/cars/maruti-ertiga-exterior.webp",
      "/cars/maruti-ertiga-front-seats.webp",
      "/cars/maruti-ertiga-rear-seats.webp",
    ],
    primary_image: "/cars/maruti-ertiga-exterior.webp",
  },
  {
    id: "toyota-innova-crysta",
    model: "Toyota Innova Crysta",
    category: "MUV",
    seats: null,
    luggage: null,
    ac: null,
    transmission: null,
    fuel_type: null,
    features: [],
    images: [
      "/cars/innova-1.png",
      "/cars/innova-back.png",
    ],
    primary_image: "/cars/innova-1.png",
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
    features: ["Spacious Cabin", "Music System", "Charging Ports"],
    images: [
      "/cars/chevrolet-enjoy-exterior.webp",
      "/cars/chevrolet-enjoy-interior.webp",
    ],
    primary_image: "/cars/chevrolet-enjoy-exterior.webp",
  },
  {
    id: "buses",
    model: "Buses (AC / Non-AC)",
    category: "Bus",
    seats: null,
    luggage: null,
    ac: null,
    transmission: null,
    fuel_type: null,
    features: ["AC buses", "Non-AC buses"],
    images: [
      "/cars/Bus-1.jpeg",
      "/cars/Bus-2.jpeg",
    ],
    primary_image: "/cars/Bus-1.jpeg",
  },
];

export const CARS: Car[] = VEHICLES.map((vehicle) => ({
  ...vehicle,
  rates: VEHICLE_RATES[vehicle.id],
}));
