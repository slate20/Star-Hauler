
// src/lib/server-actions/uexcorp-actions.ts
'use server';

import type { UEXLocation, UEXCommodity } from '@/lib/uexcorp-types';

const UEXCORP_API_BASE_URL = 'https://api.uexcorp.space';

export async function fetchDestinationsAction(): Promise<UEXLocation[]> {
  try {
    const response = await fetch(`${UEXCORP_API_BASE_URL}/locations`);
    if (!response.ok) {
      console.error('Failed to fetch UEXCorp destinations:', response.status, await response.text());
      return [];
    }
    // The API returns data directly as an array of locations
    const data: UEXLocation[] = await response.json();
    return data.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching UEXCorp destinations:', error);
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
  } catch (error) { // Added opening brace here
    console.error('Error fetching UEXCorp commodities:', error);
    return [];
  }
}

