export interface VehicleRates {
  localPerKm?: number;
  outstationPerKm?: number;
  airportFlat?: number;
  package?: { km: number; total: number };
  minKmPerDay?: number;
  driverPerDay?: number;
}

// Prices are in INR. Omit a field to hide it from the website.
export const VEHICLE_RATES = {
  "maruti-suzuki-dzire": {
    localPerKm: 14,
    outstationPerKm: 13,
    airportFlat: 1000,
    package: { km: 300, total: 3900 },
  },
  "maruti-ertiga": {
    localPerKm: 15,
    outstationPerKm: 15,
    airportFlat: 1500,
    package: { km: 300, total: 4500 },
  },
  "toyota-innova-crysta": {
    localPerKm: 20,
    outstationPerKm: 20,
    airportFlat: 2000,
    package: { km: 300, total: 6000 },
  },
  "chevrolet-enjoy": {
    localPerKm: 16,
    outstationPerKm: 16,
    airportFlat: 2000,
    package: { km: 300, total: 4800 },
  },
  buses: {},
} satisfies Record<string, VehicleRates>;

export type VehicleId = keyof typeof VEHICLE_RATES;
