/**
 * This file contains predefined data for Star-Hauler application
 * including destinations and cargo/commodity types
 */

export interface Destination {
  id: string;
  name: string;
  system?: string; // Optional system name
  body?: string; // Optional celestial body name
  type?: string;   // Optional type (planet, moon, station, etc.)
}

export interface Commodity {
  id: string;
  name: string;
  category?: string; // Optional category (minerals, gases, agricultural, etc.)
}

// Initial list of destinations - can be expanded
export const destinations: Destination[] = [
  { id: "arc-l1", name: "ARC-L1", system: "Stanton", type: "Lagrange Point" },
  { id: "arc-l2", name: "ARC-L2", system: "Stanton", type: "Lagrange Point" },
  { id: "arc-l3", name: "ARC-L3", system: "Stanton", type: "Lagrange Point" },
  { id: "arc-l4", name: "ARC-L4", system: "Stanton", type: "Lagrange Point" },
  { id: "arc-l5", name: "ARC-L5", system: "Stanton", type: "Lagrange Point" },
  { id: "area18", name: "Area 18", system: "Stanton", body: "ArcCorp", type: "Landing Zone" },
  { id: "baijini", name: "Baijini Point", system: "Stanton", body: "ArcCorp", type: "Station" },
  { id: "riker-sp", name: "Riker Memorial Spaceport", system: "Stanton", body: "ArcCorp", type: "Spaceport" },
  { id: "cru-l1", name: "CRU-L1", system: "Stanton", type: "Lagrange Point" },
  { id: "cru-l4", name: "CRU-L4", system: "Stanton", type: "Lagrange Point" },
  { id: "cru-l5", name: "CRU-L5", system: "Stanton", type: "Lagrange Point" },
  { id: "orison", name: "Orison", system: "Stanton", body: "Crusader", type: "Landing Zone" },
  { id: "august-dunlow-sp", name: "August Dunlow Spaceport", system: "Stanton", body: "Crusader", type: "Spaceport" },
  { id: "seraphim-station", name: "Seraphim Station", system: "Crusader", type: "Station" },
  { id: "everus-harbor", name: "Everus Harbor", system: "Stanton", body: "Hurston", type: "Station" },
  { id: "grim-hex", name: "Grim HEX", system: "Stanton", body: "Grim HEX", type: "Station" },
  { id: "hur-l1", name: "HUR-L1", system: "Stanton", body: "HUR-L1", type: "Lagrange Point" },
  { id: "hur-l2", name: "HUR-L2", system: "Stanton", body: "HUR-L2", type: "Lagrange Point" },
  { id: "hur-l3", name: "HUR-L3", system: "Stanton", body: "HUR-L3", type: "Lagrange Point" },
  { id: "hur-l4", name: "HUR-L4", system: "Stanton", body: "HUR-L4", type: "Lagrange Point" },
  { id: "hur-l5", name: "HUR-L5", system: "Stanton", body: "HUR-L5", type: "Lagrange Point" },
  { id: "hurston", name: "Lorville", system: "Stanton", body: "Hurston", type: "Landing Zone" },
  { id: "teasa-sp", name: "Teasa Spaceport", system: "Stanton", body: "Hurston", type: "Spaceport" },
  { id: "microtech", name: "New Babbage", system: "Stanton", body: "MicroTech", type: "Landing Zone" },
  { id: "new-babbage-sp", name: "New Babbage Interstellar Spaceport", system: "Stanton", body: "MicroTech", type: "Spaceport" },
  { id: "port-tressler", name: "Port Tressler", system: "Stanton", body: "MicroTech", type: "Station" },
  { id: "mic-l1", name: "MIC-L1", system: "Stanton", type: "Lagrange Point" },
  { id: "mic-l2", name: "MIC-L2", system: "Stanton", type: "Lagrange Point" },
  { id: "mic-l3", name: "MIC-L3", system: "Stanton", type: "Lagrange Point" },
  { id: "mic-l4", name: "MIC-L4", system: "Stanton", type: "Lagrange Point" },
  { id: "mic-l5", name: "MIC-L5", system: "Stanton", type: "Lagrange Point" },
  { id: "terra-gw", name: "Terra Gateway", system: "Stanton", type: "Jump Point" },
  { id: "pyro-gw", name: "Pyro Gateway", system: "Stanton", type: "Jump Point" },
  { id: "magnus-gw", name: "Magnus Gateway", system: "Stanton", type: "Jump Point" },
  { id: "arccorp-mining-area-045", name: "ArcCorp Mining Area 045", system: "Stanton", body: "Wala", type: "Outpost" },
  { id: "arccorp-mining-area-048", name: "ArcCorp Mining Area 048", system: "Stanton", body: "Wala", type: "Outpost" },
  { id: "arccorp-mining-area-056", name: "ArcCorp Mining Area 056", system: "Stanton", body: "Wala", type: "Outpost" },
  { id: "arccorp-mining-area-061", name: "ArcCorp Mining Area 061", system: "Stanton", body: "Wala", type: "Outpost" },
  { id: "arccorp-mining-area-141", name: "ArcCorp Mining Area 141", system: "Stanton", body: "Daymar", type: "Outpost" },
  { id: "arccorp-mining-area-157", name: "ArcCorp Mining Area 157", system: "Stanton", body: "Yela", type: "Outpost" },
  { id: "benson-mining-outpost", name: "Benson Mining Outpost", system: "Stanton", body: "Yela", type: "Outpost" },
  { id: "bountiful-harvest-hydroponics", name: "Bountiful Harvest Hydroponics", system: "Stanton", body: "Daymar", type: "Outpost" },
  { id: "brio-s-breaker-yard", name: "Brio's Breaker Yard", system: "Stanton", body: "Daymar", type: "Outpost" },
  { id: "bud-s-growery", name: "Bud's Growery", system: "Stanton", body: "Euterpe", type: "Outpost" },
  { id: "deakins-research", name: "Deakins Research", system: "Stanton", body: "Yela", type: "Outpost" },
  { id: "devlin-scrap---salvage", name: "Devlin Scrap & Salvage", system: "Stanton", body: "Euterpe", type: "Outpost" },
  { id: "gallete-family-farms", name: "Gallete Family Farms", system: "Stanton", body: "Cellin", type: "Outpost" },
  { id: "hdms-anderson", name: "HDMS-Anderson", system: "Stanton", body: "Aberdeen", type: "Outpost" },
  { id: "hdms-bezdek", name: "HDMS-Bezdek", system: "Stanton", body: "Arial", type: "Outpost" },
  { id: "hdms-edmond", name: "HDMS-Edmond", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "hdms-hadley", name: "HDMS-Hadley", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "hdms-hahn", name: "HDMS-Hahn", system: "Stanton", body: "Magda", type: "Outpost" },
  { id: "hdms-lathan", name: "HDMS-Lathan", system: "Stanton", body: "Arial", type: "Outpost" },
  { id: "hdms-norgaard", name: "HDMS-Norgaard", system: "Stanton", body: "Aberdeen", type: "Outpost" },
  { id: "hdms-oparei", name: "HDMS-Oparei", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "hdms-perlman", name: "HDMS-Perlman", system: "Stanton", body: "Magda", type: "Outpost" },
  { id: "hdms-pinewood", name: "HDMS-Pinewood", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "hdms-ryder", name: "HDMS-Ryder", system: "Stanton", body: "Ita", type: "Outpost" },
  { id: "hdms-stanhope", name: "HDMS-Stanhope", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "hdms-thedus", name: "HDMS-Thedus", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "hdms-woodruff", name: "HDMS-Woodruff", system: "Stanton", body: "Ita", type: "Outpost" },
  { id: "hickes-research", name: "Hickes Research", system: "Stanton", body: "Cellin", type: "Outpost" },
  { id: "humboldt-mines", name: "Humboldt Mines", system: "Stanton", body: "Lyria", type: "Outpost" },
  { id: "jumptown", name: "Jumptown", system: "Stanton", body: "Yela", type: "Outpost" },
  { id: "kudre-ore", name: "Kudre Ore", system: "Stanton", body: "Daymar", type: "Outpost" },
  { id: "loveridge-mineral-reserve", name: "Loveridge Mineral Reserve", system: "Stanton", body: "Lyria", type: "Outpost" },
  { id: "nt-999-xx", name: "NT-999-XX", system: "Stanton", body: "Yela", type: "Outpost" },
  { id: "nuen-waste-management", name: "Nuen Waste Management", system: "Stanton", body: "Daymar", type: "Outpost" },
  { id: "outpost-54", name: "Outpost 54", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "paradise-cove", name: "Paradise Cove", system: "Stanton", body: "Wala", type: "Outpost" },
  { id: "private-property", name: "Private Property", system: "Stanton", body: "Cellin", type: "Outpost" },
  { id: "raven-s-roost", name: "Raven's Roost", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "rayari-anvik-research-outpost", name: "Rayari Anvik Research Outpost", system: "Stanton", body: "Calliope", type: "Outpost" },
  { id: "rayari-cantwell-research-outpost", name: "Rayari Cantwell Research Outpost", system: "Stanton", body: "Clio", type: "Outpost" },
  { id: "rayari-deltana-research-outpost", name: "Rayari Deltana Research Outpost", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "rayari-kaltag-research-outpost", name: "Rayari Kaltag Research Outpost", system: "Stanton", body: "Calliope", type: "Outpost" },
  { id: "rayari-mcgrath-research-outpost", name: "Rayari McGrath Research Outpost", system: "Stanton", body: "Clio", type: "Outpost" },
  { id: "reclamation---disposal-orinth", name: "Reclamation & Disposal Orinth", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "samson---son-s-salvage-center", name: "Samson & Son's Salvage Center", system: "Stanton", body: "Wala", type: "Outpost" },
  { id: "shubin-mining-facility-sal-2", name: "Shubin Mining Facility SAL-2", system: "Stanton", body: "Lyria", type: "Outpost" },
  { id: "shubin-mining-facility-sal-5", name: "Shubin Mining Facility SAL-5", system: "Stanton", body: "Lyria", type: "Outpost" },
  { id: "shubin-mining-facility-scd-1", name: "Shubin Mining Facility SCD-1", system: "Stanton", body: "Daymar", type: "Outpost" },
  { id: "shubin-mining-facility-sm0-10", name: "Shubin Mining Facility SM0-10", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "shubin-mining-facility-sm0-13", name: "Shubin Mining Facility SM0-13", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "shubin-mining-facility-sm0-18", name: "Shubin Mining Facility SM0-18", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "shubin-mining-facility-sm0-22", name: "Shubin Mining Facility SM0-22", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "shubin-mining-facility-smca-6", name: "Shubin Mining Facility SMCa-6", system: "Stanton", body: "Calliope", type: "Outpost" },
  { id: "shubin-mining-facility-smca-8", name: "Shubin Mining Facility SMCa-8", system: "Stanton", body: "Calliope", type: "Outpost" },
  { id: "terra-mills-hydrofarm", name: "Terra Mills HydroFarm", system: "Stanton", body: "Cellin", type: "Outpost" },
  { id: "the-necropolis", name: "The Necropolis", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "the-orphanage", name: "The Orphanage", system: "Stanton", body: "Lyria", type: "Outpost" },
  { id: "tram---myers-mining", name: "Tram & Myers Mining", system: "Stanton", body: "Cellin", type: "Outpost" },
  { id: "shady-glen", name: "Shady Glen", system: "Stanton", body: "Wala", type: "Outpost" },
  { id: "astor-s-clearing", name: "Astor's Clearing", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "harper-s-point", name: "Harper's Point", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "dunboro", name: "Dunboro", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "weeping-cove", name: "Weeping Cove", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "maker-s-point", name: "Maker's Point", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "rappel", name: "Rappel", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "picker-s-field", name: "Picker's Field", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "nt-999-xxii", name: "NT-999-XXII", system: "Stanton", body: "Yela", type: "Outpost" },
  { id: "zephyr", name: "Zephyr", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "cutter-s-rig", name: "Cutter's Rig", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "finn-s-folly", name: "Finn's Folly", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "ludlow", name: "Ludlow", system: "Stanton", body: "Hurston", type: "Outpost" },
  { id: "bloodshot-ridge", name: "Bloodshot Ridge", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "frostbite", name: "Frostbite", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "ghost-hollow", name: "Ghost Hollow", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "moreland-hills", name: "Moreland Hills", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "razor-s-edge", name: "Razor's Edge", system: "Stanton", body: "MicroTech", type: "Outpost" },
  { id: "sakura-sun-magnolia-workcenter", name: "Sakura Sun Magnolia Workcenter", system: "Stanton", body: "Hurston", type: "Distribution Center" },
  { id: "sakura-sun-goldenrod-workcenter", name: "Sakura Sun Goldenrod Workcenter", system: "Stanton", body: "Hurston", type: "Distribution Center" },
  { id: "hdpc-cassilo", name: "HDPC-Cassilo", system: "Stanton", body: "Hurston", type: "Distribution Center" },
  { id: "hdpc-farnesway", name: "HDPC-Farnesway", system: "Stanton", body: "Hurston", type: "Distribution Center" },
  { id: "covalex-s1dc06", name: "Covalex Distribution Centre S1DC06", system: "Stanton", body: "Hurston", type: "Distribution Center" },
  { id: "covalex-s1dc05", name: "Covalex Distribution Centre S1DC05", system: "Stanton", body: "MicroTech", type: "Distribution Center" },
  { id: "cry-astro-19-02", name: "Cry-Astro Processing Plant 19-02", system: "Stanton", body: "MicroTech", type: "Distribution Center" },
  { id: "cry-astro-34-12", name: "Cry-Astro Processing Plant 34-12", system: "Stanton", body: "MicroTech", type: "Distribution Center" },
  { id: "greycat-pc-b", name: "Greycat Stanton I Production Complex-B", system: "Stanton", body: "Hurston", type: "Distribution Center" },
  { id: "greycat-pc-a", name: "Greycat Stanton IV Production Complex-A", system: "Stanton", body: "MicroTech", type: "Distribution Center" },
  { id: "dupree-industrial", name: "Dupree Industrial Manufacturing Facility", system: "Stanton", body: "Hurston", type: "Distribution Center" },
  { id: "microtech-ld-s4ld01", name: "MicroTech Logistics Depot S4LD01", system: "Stanton", body: "MicroTech", type: "Distribution Center" },
  { id: "microtech-ld-s4ld13", name: "MicroTech Logistics Depot S4LD13", system: "Stanton", body: "MicroTech", type: "Distribution Center" },
];

// Initial list of commodities - can be expanded
export const commodities: Commodity[] = [
  { id: "argon", name: "Argon", category: "Gas" },
  { id: "agricium", name: "Agricium", category: "Minerals" },
  { id: "agricultural-supplies", name: "Agricultural Supplies", category: "Industrial" },
  { id: "aluminum", name: "Aluminum", category: "Minerals" },
  { id: "astatine", name: "Astatine", category: "Gas" },
  { id: "beryl", name: "Beryl", category: "Minerals" },
  { id: "carbon", name: "Carbon", category: "Minerals" },
  { id: "chlorine", name: "Chlorine", category: "Gas" },
  { id: "corundum", name: "Corundum", category: "Minerals" },
  { id: "diamond", name: "Diamond", category: "Minerals" },
  { id: "distilled-spirits", name: "Distilled Spirits", category: "Food & Drink" },
  { id: "gold", name: "Gold", category: "Minerals" },
  { id: "hydrogen", name: "Hydrogen", category: "Gas" },
  { id: "hydrogen-fuel", name: "Hydrogen Fuel", category: "Fuel" },
  { id: "iodine", name: "Iodine", category: "Gas" },
  { id: "iron", name: "Iron", category: "Minerals" },
  { id: "laranite", name: "Laranite", category: "Minerals" },
  { id: "medical-supplies", name: "Medical Supplies", category: "Medical" },
  { id: "mercury", name: "Mercury", category: "Gas" },
  { id: "nitrogen", name: "Nitrogen", category: "Gas" },
  { id: "processed-food", name: "Processed Food", category: "Food & Drink" },
  { id: "pressurized-ice", name: "Pressurized Ice", category: "Food & Drink" },
  { id: "quartz", name: "Quartz", category: "Minerals" },
  { id: "quantum-fuel", name: "Quantum Fuel", category: "Fuel" },
  { id: "scrap", name: "Scrap", category: "Waste" },
  { id: "ship-ammunition", name: "Ship Ammunition", category: "Ammunition" },
  { id: "silicon", name: "Silicon", category: "Minerals" },
  { id: "steel", name: "Steel", category: "Minerals" },
  { id: "stims", name: "Stims", category: "Medical" },
  { id: "tin", name: "Tin", category: "Minerals" },
  { id: "titanium", name: "Titanium", category: "Minerals" },
  { id: "tungsten", name: "Tungsten", category: "Minerals" },
  { id: "waste", name: "Waste", category: "Waste" },
];
