/**
 * Centralized Mock Data for WayFind App
 *
 * This file provides fallback data for all components when the Azure backend is unavailable.
 * All data structures match the database schema defined in types/database.ts.
 *
 * Usage: Import specific mock data arrays from this file in contexts or components.
 */

import {
  Adventurer,
  Region,
  Landmark,
  Adventure,
  Token,
  CompletedAdventure,
  AdventureWithRegion,
  Point,
} from "@/types/database";

// ============================================================================
// Mock Adventurers (Users)
// ============================================================================

export const mockAdventurers: Adventurer[] = [
  {
    id: 1,
    username: "explorer_alice",
    password: "password123", // Note: In production, passwords should be hashed
    profilepicture: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    username: "treasure_hunter",
    password: "hunter2024",
    profilepicture: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    username: "adventure_bob",
    password: "bobadventure",
    profilepicture: null,
  },
  {
    id: 4,
    username: "demo_user",
    password: "demo",
    profilepicture: "https://i.pravatar.cc/150?img=4",
  },
];

// ============================================================================
// Mock Regions
// ============================================================================

export const mockRegions: Region[] = [
  {
    id: 1,
    adventurerid: 1,
    name: "Downtown Discovery",
    description: "Explore the heart of the city with this urban adventure",
    location: { x: 42.9634, y: -85.6681 } as Point, // Grand Rapids, MI
    radius: 500, // meters
  },
  {
    id: 2,
    adventurerid: 1,
    name: "Campus Quest",
    description: "Discover hidden gems around the college campus",
    location: { x: 42.9311, y: -85.5872 } as Point, // Calvin University
    radius: 800,
  },
  {
    id: 3,
    adventurerid: 2,
    name: "Riverside Trail",
    description: "Follow the scenic river path and uncover local history",
    location: { x: 42.9693, y: -85.6558 } as Point, // Grand River
    radius: 1000,
  },
  {
    id: 4,
    adventurerid: 2,
    name: "Park Explorer",
    description: "A nature-focused adventure in the city park",
    location: { x: 42.9719, y: -85.6400 } as Point, // Millennium Park area
    radius: 600,
  },
  {
    id: 5,
    adventurerid: 3,
    name: "Historical Walk",
    description: "Tour historic landmarks and learn local heritage",
    location: { x: 42.9614, y: -85.6557 } as Point, // Heritage Hill
    radius: 450,
  },
];

// ============================================================================
// Mock Landmarks
// ============================================================================

export const mockLandmarks: Landmark[] = [
  // Downtown Discovery landmarks (Region 1)
  { id: 1, regionid: 1, name: "Central Fountain", location: { x: 42.9640, y: -85.6685 } as Point },
  { id: 2, regionid: 1, name: "City Hall Steps", location: { x: 42.9628, y: -85.6677 } as Point },
  { id: 3, regionid: 1, name: "Art Museum", location: { x: 42.9645, y: -85.6695 } as Point },
  { id: 4, regionid: 1, name: "Plaza Park", location: { x: 42.9620, y: -85.6670 } as Point },

  // Campus Quest landmarks (Region 2)
  { id: 5, regionid: 2, name: "Library Entrance", location: { x: 42.9315, y: -85.5868 } as Point },
  { id: 6, regionid: 2, name: "Chapel Bell Tower", location: { x: 42.9308, y: -85.5875 } as Point },
  { id: 7, regionid: 2, name: "Science Building", location: { x: 42.9320, y: -85.5880 } as Point },
  { id: 8, regionid: 2, name: "Student Union", location: { x: 42.9305, y: -85.5865 } as Point },

  // Riverside Trail landmarks (Region 3)
  { id: 9, regionid: 3, name: "Old Bridge", location: { x: 42.9700, y: -85.6565 } as Point },
  { id: 10, regionid: 3, name: "Riverbank Statue", location: { x: 42.9688, y: -85.6552 } as Point },
  { id: 11, regionid: 3, name: "Boat Launch", location: { x: 42.9695, y: -85.6548 } as Point },
  { id: 12, regionid: 3, name: "Fishing Pier", location: { x: 42.9690, y: -85.6560 } as Point },

  // Park Explorer landmarks (Region 4)
  { id: 13, regionid: 4, name: "Nature Center", location: { x: 42.9722, y: -85.6405 } as Point },
  { id: 14, regionid: 4, name: "Picnic Grove", location: { x: 42.9715, y: -85.6395 } as Point },
  { id: 15, regionid: 4, name: "Playground", location: { x: 42.9725, y: -85.6410 } as Point },

  // Historical Walk landmarks (Region 5)
  { id: 16, regionid: 5, name: "Victorian House", location: { x: 42.9618, y: -85.6560 } as Point },
  { id: 17, regionid: 5, name: "Historic Church", location: { x: 42.9610, y: -85.6554 } as Point },
  { id: 18, regionid: 5, name: "Old Schoolhouse", location: { x: 42.9620, y: -85.6565 } as Point },
];

// ============================================================================
// Mock Adventures
// ============================================================================

export const mockAdventures: Adventure[] = [
  {
    id: 1,
    adventurerid: 1,
    regionid: 1,
    name: "City Secrets",
    numtokens: 5,
    location: { x: 42.9634, y: -85.6681 } as Point,
  },
  {
    id: 2,
    adventurerid: 1,
    regionid: 2,
    name: "Campus Chronicles",
    numtokens: 6,
    location: { x: 42.9311, y: -85.5872 } as Point,
  },
  {
    id: 3,
    adventurerid: 2,
    regionid: 3,
    name: "River Revelations",
    numtokens: 4,
    location: { x: 42.9693, y: -85.6558 } as Point,
  },
  {
    id: 4,
    adventurerid: 2,
    regionid: 4,
    name: "Nature's Mysteries",
    numtokens: 7,
    location: { x: 42.9719, y: -85.6400 } as Point,
  },
  {
    id: 5,
    adventurerid: 3,
    regionid: 5,
    name: "Heritage Hunt",
    numtokens: 5,
    location: { x: 42.9614, y: -85.6557 } as Point,
  },
  {
    id: 6,
    adventurerid: 1,
    regionid: 1,
    name: "Downtown Dash",
    numtokens: 3,
    location: { x: 42.9640, y: -85.6690 } as Point,
  },
];

// ============================================================================
// Mock Tokens
// ============================================================================

export const mockTokens: Token[] = [
  // City Secrets tokens (Adventure 1)
  { id: 1, adventureid: 1, location: { x: 42.9640, y: -85.6685 } as Point, hint: "Look near the water feature", tokenorder: 1 },
  { id: 2, adventureid: 1, location: { x: 42.9628, y: -85.6677 } as Point, hint: "At the top of the stairs", tokenorder: 2 },
  { id: 3, adventureid: 1, location: { x: 42.9645, y: -85.6695 } as Point, hint: "Where art meets history", tokenorder: 3 },
  { id: 4, adventureid: 1, location: { x: 42.9620, y: -85.6670 } as Point, hint: "Under the old oak tree", tokenorder: 4 },
  { id: 5, adventureid: 1, location: { x: 42.9635, y: -85.6675 } as Point, hint: "Near the street musician's corner", tokenorder: 5 },

  // Campus Chronicles tokens (Adventure 2)
  { id: 6, adventureid: 2, location: { x: 42.9315, y: -85.5868 } as Point, hint: "Where knowledge begins", tokenorder: 1 },
  { id: 7, adventureid: 2, location: { x: 42.9308, y: -85.5875 } as Point, hint: "Listen for the bells", tokenorder: 2 },
  { id: 8, adventureid: 2, location: { x: 42.9320, y: -85.5880 } as Point, hint: "Discover the periodic table", tokenorder: 3 },
  { id: 9, adventureid: 2, location: { x: 42.9305, y: -85.5865 } as Point, hint: "Where students gather", tokenorder: 4 },
  { id: 10, adventureid: 2, location: { x: 42.9318, y: -85.5870 } as Point, hint: "Behind the old statue", tokenorder: 5 },
  { id: 11, adventureid: 2, location: { x: 42.9312, y: -85.5878 } as Point, hint: "Near the fountain", tokenorder: 6 },

  // River Revelations tokens (Adventure 3)
  { id: 12, adventureid: 3, location: { x: 42.9700, y: -85.6565 } as Point, hint: "Cross the old bridge", tokenorder: 1 },
  { id: 13, adventureid: 3, location: { x: 42.9688, y: -85.6552 } as Point, hint: "Look for the bronze figure", tokenorder: 2 },
  { id: 14, adventureid: 3, location: { x: 42.9695, y: -85.6548 } as Point, hint: "Where boats begin their journey", tokenorder: 3 },
  { id: 15, adventureid: 3, location: { x: 42.9690, y: -85.6560 } as Point, hint: "Cast your eyes to the water", tokenorder: 4 },

  // Nature's Mysteries tokens (Adventure 4)
  { id: 16, adventureid: 4, location: { x: 42.9722, y: -85.6405 } as Point, hint: "Learn about local wildlife", tokenorder: 1 },
  { id: 17, adventureid: 4, location: { x: 42.9715, y: -85.6395 } as Point, hint: "Find the perfect lunch spot", tokenorder: 2 },
  { id: 18, adventureid: 4, location: { x: 42.9725, y: -85.6410 } as Point, hint: "Where children laugh", tokenorder: 3 },
  { id: 19, adventureid: 4, location: { x: 42.9718, y: -85.6402 } as Point, hint: "Follow the trail markers", tokenorder: 4 },
  { id: 20, adventureid: 4, location: { x: 42.9720, y: -85.6398 } as Point, hint: "Near the tallest tree", tokenorder: 5 },
  { id: 21, adventureid: 4, location: { x: 42.9716, y: -85.6408 } as Point, hint: "By the bird watching spot", tokenorder: 6 },
  { id: 22, adventureid: 4, location: { x: 42.9724, y: -85.6395 } as Point, hint: "Hidden in the flowers", tokenorder: 7 },

  // Heritage Hunt tokens (Adventure 5)
  { id: 23, adventureid: 5, location: { x: 42.9618, y: -85.6560 } as Point, hint: "Admire the architecture", tokenorder: 1 },
  { id: 24, adventureid: 5, location: { x: 42.9610, y: -85.6554 } as Point, hint: "Where bells ring on Sunday", tokenorder: 2 },
  { id: 25, adventureid: 5, location: { x: 42.9620, y: -85.6565 } as Point, hint: "Education's old home", tokenorder: 3 },
  { id: 26, adventureid: 5, location: { x: 42.9612, y: -85.6558 } as Point, hint: "Read the historical marker", tokenorder: 4 },
  { id: 27, adventureid: 5, location: { x: 42.9616, y: -85.6562 } as Point, hint: "Near the century-old oak", tokenorder: 5 },

  // Downtown Dash tokens (Adventure 6)
  { id: 28, adventureid: 6, location: { x: 42.9640, y: -85.6690 } as Point, hint: "Start at the center", tokenorder: 1 },
  { id: 29, adventureid: 6, location: { x: 42.9638, y: -85.6685 } as Point, hint: "Quick turn left", tokenorder: 2 },
  { id: 30, adventureid: 6, location: { x: 42.9642, y: -85.6692 } as Point, hint: "Final sprint!", tokenorder: 3 },
];

// ============================================================================
// Mock Completed Adventures
// ============================================================================

export const mockCompletedAdventures: CompletedAdventure[] = [
  {
    id: 1,
    adventurerid: 1,
    adventureid: 3,
    completiondate: "2024-11-15T14:30:00Z",
    completiontime: "00:45:30", // 45 minutes 30 seconds
  },
  {
    id: 2,
    adventurerid: 1,
    adventureid: 5,
    completiondate: "2024-11-20T10:15:00Z",
    completiontime: "01:12:45",
  },
  {
    id: 3,
    adventurerid: 2,
    adventureid: 1,
    completiondate: "2024-11-18T16:20:00Z",
    completiontime: "00:38:12",
  },
  {
    id: 4,
    adventurerid: 2,
    adventureid: 2,
    completiondate: "2024-11-22T09:45:00Z",
    completiontime: "01:05:22",
  },
  {
    id: 5,
    adventurerid: 3,
    adventureid: 4,
    completiondate: "2024-11-25T13:10:00Z",
    completiontime: "01:28:55",
  },
  {
    id: 6,
    adventurerid: 4,
    adventureid: 1,
    completiondate: "2024-12-01T11:30:00Z",
    completiontime: "00:42:18",
  },
  {
    id: 7,
    adventurerid: 4,
    adventureid: 6,
    completiondate: "2024-12-05T15:00:00Z",
    completiontime: "00:22:45",
  },
];

// ============================================================================
// Mock Adventures with Regions (Composed Data)
// ============================================================================

export const mockAdventuresWithRegions: AdventureWithRegion[] = mockAdventures.map((adventure) => {
  const region = mockRegions.find((r) => r.id === adventure.regionid);
  if (!region) {
    throw new Error(`Region not found for adventure ${adventure.id}`);
  }
  return {
    ...adventure,
    region,
  };
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get adventures for a specific region
 */
export function getAdventuresByRegion(regionId: number): Adventure[] {
  return mockAdventures.filter((adv) => adv.regionid === regionId);
}

/**
 * Get tokens for a specific adventure
 */
export function getTokensByAdventure(adventureId: number): Token[] {
  return mockTokens.filter((token) => token.adventureid === adventureId);
}

/**
 * Get landmarks for a specific region
 */
export function getLandmarksByRegion(regionId: number): Landmark[] {
  return mockLandmarks.filter((landmark) => landmark.regionid === regionId);
}

/**
 * Get completed adventures for a specific user
 */
export function getCompletedAdventuresByUser(adventurerId: number): CompletedAdventure[] {
  return mockCompletedAdventures.filter((ca) => ca.adventurerid === adventurerId);
}

/**
 * Get regions created by a specific user
 */
export function getRegionsByCreator(adventurerId: number): Region[] {
  return mockRegions.filter((region) => region.adventurerid === adventurerId);
}

/**
 * Get adventures created by a specific user
 */
export function getAdventuresByCreator(adventurerId: number): Adventure[] {
  return mockAdventures.filter((adventure) => adventure.adventurerid === adventurerId);
}

/**
 * Find user by username and password (for mock login)
 */
export function authenticateUser(username: string, password: string): Adventurer | null {
  const user = mockAdventurers.find(
    (adv) => adv.username === username && adv.password === password
  );
  return user || null;
}

/**
 * Get adventure with all related data
 */
export function getCompleteAdventure(adventureId: number) {
  const adventure = mockAdventures.find((adv) => adv.id === adventureId);
  if (!adventure) return null;

  const region = mockRegions.find((r) => r.id === adventure.regionid);
  const tokens = getTokensByAdventure(adventureId);
  const landmarks = region ? getLandmarksByRegion(region.id) : [];
  const creator = mockAdventurers.find((adv) => adv.id === adventure.adventurerid);

  return {
    ...adventure,
    region,
    tokens,
    landmarks,
    creator,
  };
}

// ============================================================================
// Export all mock data
// ============================================================================

export const mockData = {
  adventurers: mockAdventurers,
  regions: mockRegions,
  landmarks: mockLandmarks,
  adventures: mockAdventures,
  tokens: mockTokens,
  completedAdventures: mockCompletedAdventures,
  adventuresWithRegions: mockAdventuresWithRegions,
};
