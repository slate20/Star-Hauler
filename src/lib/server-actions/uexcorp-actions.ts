
// src/lib/server-actions/uexcorp-actions.ts
'use server';

import type { UEXLocation, UEXCommodity, UEXCelestialBodySimple } from '@/lib/uexcorp-types';

const UEXCORP_API_BASE_URL = 'https://api.uexcorp.space/2.0';
const STANTON_SYSTEM_ID = 68;

// Helper interface for the raw location data from the new API endpoints
interface ApiLocationItem {
  uuid: string;
  name: string;
  code: string;
  type: string;
  celestial_body_uuid: string;
  celestial_body_name: string;
  celestial_body_type: string;
  // other fields like id_star_system, affiliation_uuid, etc., are ignored for now
}

// Mapper function to transform raw API location item to our UEXLocation structure
const mapApiLocationToUEXLocation = (item: ApiLocationItem): UEXLocation => {
  return {
    uuid: item.uuid,
    name: item.name,
    code: item.code,
    type: item.type,
    celestial_body: {
      uuid: item.celestial_body_uuid,
      name: item.celestial_body_name,
      type: item.celestial_body_type,
    } as UEXCelestialBodySimple, // Cast to ensure type compatibility
  };
};

export async function fetchDestinationsAction(): Promise<UEXLocation[]> {
  const urls = [
    `${UEXCORP_API_BASE_URL}/cities?id_star_system=${STANTON_SYSTEM_ID}`,
    `${UEXCORP_API_BASE_URL}/space_stations?id_star_system=${STANTON_SYSTEM_ID}`,
    `${UEXCORP_API_BASE_URL}/outposts?id_star_system=${STANTON_SYSTEM_ID}`,
  ];

  try {
    const responses = await Promise.all(urls.map(url => fetch(url)));
    
    let allLocationsRaw: ApiLocationItem[] = [];

    for (const response of responses) {
      if (!response.ok) {
        // Log specific URL that failed
        console.error(`Failed to fetch UEXCorp locations from ${response.url}:`, response.status, await response.text());
        // Optionally, continue with other successful fetches or throw an error to fail all
        // For now, if one fails, we'll consider the whole operation problematic for destinations.
        // Though, Promise.all would have already rejected if a fetch itself failed network-wise.
        // This check is more for non-2xx HTTP statuses.
        // To be robust, you might collect successful ones and ignore failed ones, or ensure all succeed.
        // For simplicity, if any response is not OK, we will return empty.
        // A more advanced handling would be to accumulate successful results.
        // throw new Error(`Failed to fetch data from ${response.url}`);
      }
      if (response.ok) { // Only process OK responses
        const data: ApiLocationItem[] = await response.json();
        if (Array.isArray(data)) { // Ensure data is an array
            allLocationsRaw = allLocationsRaw.concat(data);
        } else {
            console.warn(`Expected array from ${response.url}, but received:`, data);
        }
      } else {
         console.error(`Non-OK response from ${response.url}: ${response.status}`);
         // Decide if this should stop all destination fetching or just skip this source.
         // For now, we'll let it proceed and potentially result in fewer/no locations if some fail.
      }
    }
    
    const mappedLocations: UEXLocation[] = allLocationsRaw.map(mapApiLocationToUEXLocation);
    
    return mappedLocations.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error('Error fetching or processing UEXCorp destinations:', error);
    return [];
  }
}

export async function fetchCommoditiesAction(): Promise<UEXCommodity[]> {
  try {
    const response = await fetch(`${UEXCORP_API_BASE_URL}/commodities`);
    if (!response.ok) {
      console.error('Failed to fetch UEXCorp commodities:', response.status, await response.text());
      return [];
    }
    // The API returns data directly as an array of commodities
    const data: UEXCommodity[] = await response.json();
    return data.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching UEXCorp commodities:', error);
    return [];
  }
}
