// src/lib/uexcorp-types.ts
export interface UEXCelestialBodySimple {
  uuid: string;
  name: string;
  type: string;
}

export interface UEXLocation {
  uuid: string;
  name: string;
  code: string;
  type: string; // e.g., "PLANETARY_OUTPOST", "SPACE_STATION", "CITY"
  celestial_body: UEXCelestialBodySimple;
  // Add other fields if needed later
}

export interface UEXCommodity {
  uuid: string;
  name: string;
  type: string; // e.g., "METAL", "GAS", "FOOD"
  // Add other fields if needed later, e.g., properties.volume_per_unit
}
