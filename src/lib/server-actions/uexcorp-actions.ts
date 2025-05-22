
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

// Helper function to fetch and log for each destination type
async function fetchLocationType(url: string, typeName: string): Promise<ApiLocationItem[]> {
  console.log(`Fetching ${typeName} from: ${url}`);
  try {
    const response = await fetch(url, { cache: 'no-store' });
    console.log(`${typeName} API response status: ${response.status} ${response.statusText} for URL: ${url}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch UEXCorp ${typeName}. Status: ${response.status}. URL: ${url}. Body: ${errorText}`);
      return [];
    }

    const responseText = await response.text();
    // console.log(`Raw ${typeName} response text for ${url}:`, responseText); // Can be verbose

    if (!responseText || responseText.trim() === "") {
        console.warn(`${typeName} API returned empty or whitespace-only response body for ${url}.`);
        return [];
    }
    
    let items: ApiLocationItem[];
    try {
        items = JSON.parse(responseText);
    } catch (parseError) {
        console.error(`Failed to parse ${typeName} JSON for ${url}:`, parseError);
        console.error(`Offending JSON string for ${typeName} from ${url}:`, responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));
        return [];
    }

    if (!Array.isArray(items)) {
        console.warn(`Parsed ${typeName} data is not an array for ${url}. Data received:`, items);
        return [];
    }
    console.log(`Successfully fetched and parsed ${items.length} ${typeName} from ${url}.`);
    return items;

  } catch (error) {
    console.error(`Network or other error fetching UEXCorp ${typeName} from ${url}:`, error);
    return [];
  }
}


export async function fetchDestinationsAction(): Promise<UEXLocation[]> {
  const cityUrl = `${UEXCORP_API_BASE_URL}/cities?id_star_system=${STANTON_SYSTEM_ID}`;
  const stationUrl = `${UEXCORP_API_BASE_URL}/space_stations?id_star_system=${STANTON_SYSTEM_ID}`;
  const outpostUrl = `${UEXCORP_API_BASE_URL}/outposts?id_star_system=${STANTON_SYSTEM_ID}`;

  try {
    const [citiesRaw, stationsRaw, outpostsRaw] = await Promise.all([
      fetchLocationType(cityUrl, "cities"),
      fetchLocationType(stationUrl, "space stations"),
      fetchLocationType(outpostUrl, "outposts")
    ]);
    
    const allLocationsRaw = [...citiesRaw, ...stationsRaw, ...outpostsRaw];
    
    if (allLocationsRaw.length === 0) {
        console.warn("No locations fetched from any UEXCorp location endpoints. This might be okay if Stanton currently has no locations of these types or if all API calls failed.");
    } else {
        console.log(`Total raw locations fetched before mapping: ${allLocationsRaw.length}`);
    }

    const mappedLocations: UEXLocation[] = allLocationsRaw.map(mapApiLocationToUEXLocation);
    
    return mappedLocations.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

  } catch (error) {
    console.error('Error processing combined UEXCorp destinations (Promise.all or mapping):', error);
    return [];
  }
}

export async function fetchCommoditiesAction(): Promise<UEXCommodity[]> {
  const url = `${UEXCORP_API_BASE_URL}/commodities`;
  console.log(`Fetching commodities from: ${url}`);
  try {
    const response = await fetch(url, { cache: 'no-store' });
    console.log(`Commodities API response status: ${response.status} ${response.statusText} for URL: ${url}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch UEXCorp commodities. Status: ${response.status}. URL: ${url}. Body: ${errorText}`);
      return [];
    }

    const responseText = await response.text();
    // Log only the first 500 chars to avoid flooding console if response is huge
    console.log('Raw commodities response text (first 500 chars):', responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));


    if (!responseText || responseText.trim() === "") {
        console.warn('Commodities API returned empty or whitespace-only response body.');
        return [];
    }

    let data: UEXCommodity[];
    try {
        data = JSON.parse(responseText);
    } catch (parseError) {
        console.error('Failed to parse commodities JSON:', parseError);
        console.error('Offending JSON string for commodities (first 500 chars):', responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""));
        return [];
    }
    
    if (!Array.isArray(data)) {
        console.warn('Parsed commodities data is not an array. Data received:', data);
        return []; 
    }
    
    console.log(`Successfully fetched and parsed ${data.length} commodities.`);
    return data.sort((a, b) => {
      const nameA = a.name || "";
      const nameB = b.name || "";
      return nameA.localeCompare(nameB);
    });

  } catch (error) {
    console.error('Network or other error fetching UEXCorp commodities from URL ${url}:', error);
    return [];
  }
}
